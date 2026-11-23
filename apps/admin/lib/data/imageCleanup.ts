import 'server-only'

import { createServiceClient } from '../auth/supabaseServer'
import { storageDelete } from './client'

export type OrphanedImage = {
  id: string
  bucket: string
  object_path: string
  created_at: string
  claimed_at: string | null
  claimed_by: string | null
  cleaned_at: string | null
}

export type CleanupResult = {
  status: 'success' | 'failed' | 'missing'
  orphan_id: string
  bucket: string
  object_path: string
  error?: string
}

export type CleanupStats = {
  total_eligible: number
  claimed: number
  cleaned: number
  failed: number
  missing: number
}

const TIMEOUT_MS = 30000
const CLAIM_TIMEOUT_MINUTES = 15

async function getCleanupConfig(supabase: any): Promise<{ retentionDays: number; backlogVerifiedAt: string }> {
  // Settings table schema: key (string), value (JSONB), updated_at (timestamp)
  const { data: rows, error } = await supabase
    .from('settings')
    .select('key,value')
    .in('key', ['imageCleanupRetentionDays', 'imageCleanupBacklogVerifiedAt'])
  
  if (error) {
    throw new Error('Settings query failed: ' + error.message)
  }
  if (!rows || rows.length === 0) {
    throw new Error('No cleanup settings found in database')
  }
  
  const config: Record<string, any> = {}
  for (const row of rows || []) {
    if (row.key === 'imageCleanupRetentionDays') {
      // Validate: must be a strict non-negative integer (no decimals or non-numeric)
      const trimmedVal = String(row.value).trim()
      if (!/^\d+$/.test(trimmedVal)) {
        throw new Error('imageCleanupRetentionDays must be a non-negative integer (no decimals), got: ' + row.value)
      }
      const val = parseInt(trimmedVal, 10)
      if (!Number.isFinite(val) || val < 0) {
        throw new Error('imageCleanupRetentionDays validation failed, got: ' + row.value)
      }
      config.retentionDays = val
    }
    if (row.key === 'imageCleanupBacklogVerifiedAt') {
      const dateVal = new Date(row.value)
      if (isNaN(dateVal.getTime())) {
        throw new Error('imageCleanupBacklogVerifiedAt must be a valid ISO date, got: ' + row.value)
      }
      config.backlogVerifiedAt = row.value
    }
  }
  
  if (config.retentionDays === undefined) {
    throw new Error('Missing required setting: imageCleanupRetentionDays')
  }
  if (config.backlogVerifiedAt === undefined) {
    throw new Error('Missing required setting: imageCleanupBacklogVerifiedAt')
  }
  
  return {
    retentionDays: config.retentionDays,
    backlogVerifiedAt: config.backlogVerifiedAt,
  }
}

async function claimOrphans(supabase: any, dryRun: boolean, claimedBy: string): Promise<OrphanedImage[]> {
  try {
    const config = await getCleanupConfig(supabase)
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - config.retentionDays)
    const backlogDate = new Date(config.backlogVerifiedAt)
    const backlogPlusRetention = new Date(backlogDate.getTime() + config.retentionDays * 24 * 60 * 60 * 1000)
    const now = new Date()
    
    // Eligibility: created_at <= (now - retention) AND (created_at >= backlogVerifiedAt OR now >= backlogVerifiedAt + retention)
    const eligibleCreatedBefore = retentionDate.toISOString()
    const eligibleCreatedAfter = backlogDate.toISOString()
    const nowAfterBacklogPlus = backlogPlusRetention.getTime() <= now.getTime()
    
    // Build query with consistent backlog gate
    const buildQuery = (q: any) => {
      q = q.is('cleaned_at', null).lte('created_at', eligibleCreatedBefore)
      if (!nowAfterBacklogPlus) {
        q = q.gte('created_at', eligibleCreatedAfter)
      }
      return q
    }
    
    if (dryRun) {
      const timeoutClaimed = new Date(Date.now() - CLAIM_TIMEOUT_MINUTES * 60000).toISOString()
      let query = supabase.from('storage_orphans').select('id,bucket,object_path,created_at,claimed_at,claimed_by,cleaned_at')
      query = buildQuery(query)
      
      const { data, error } = await query
        .order('created_at', { ascending: true })
        .limit(1000)
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
      
      if (error) throw new Error('Failed to fetch orphans for dry run: ' + error.message)
      return (data || []).filter(r => r.claimed_at === null || new Date(r.claimed_at) < new Date(timeoutClaimed))
    }
    
    const timeoutClaimed = new Date(Date.now() - CLAIM_TIMEOUT_MINUTES * 60000).toISOString()
    
    // Atomic claim: UPDATE with state conditions and RETURNING
    let query = supabase.from('storage_orphans').update({ claimed_at: new Date().toISOString(), claimed_by: claimedBy })
    query = query.is('cleaned_at', null).or('claimed_at.is.null,claimed_at.lt.' + timeoutClaimed)
    query = buildQuery(query)
    
    const { data: claimed, error } = await query
      .select('id,bucket,object_path,created_at,claimed_at,claimed_by,cleaned_at')
      .order('created_at', { ascending: true })
      .limit(1000)
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    
    if (error) throw new Error('Failed to claim orphans: ' + error.message)
    return claimed || []
  } catch (err) {
    throw err
  }
}

async function isFileReferenced(supabase: any, bucket: string, objectPath: string): Promise<{ referenced: boolean; error?: string }> {
  try {
    // Settings check: separate step (not a Promise) so it doesn't break abortSignal mapping
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('key,value')
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    
    if (settingsError) {
      throw new Error('settings check failed: ' + settingsError.message)
    }
    
    const settingsHasReference = settings && settings.some(s => JSON.stringify(s.value).includes(objectPath) || JSON.stringify(s.value).includes(bucket))
    if (settingsHasReference) {
      return { referenced: true }
    }
    
    // Remaining checks: query builders only
    const checks = [
      // Check product_images
      supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('object_path', objectPath),
      
      // Check site_images
      supabase.from('site_images').select('id', { count: 'exact', head: true }).eq('object_path', objectPath),
      
      // Check collections cover
      supabase.from('collections').select('id', { count: 'exact', head: true }).eq('cover_bucket', bucket).eq('cover_object_path', objectPath),
      
      // Check products: image_url (full URL), before_image (full URL), after_image (full URL), images (JSON array)
      // Note: image_url, before_image, after_image store full URLs; order_items.product_image_url copies this URL directly
      supabase.from('products').select('id', { count: 'exact', head: true }).or('images.cs.' + JSON.stringify([{ object_path: objectPath }]) + ',images.cs.["' + objectPath + '"],image_url.eq.' + objectPath + ',before_image.eq.' + objectPath + ',after_image.eq.' + objectPath),
      
      // Check order_items.product_image_url: stores full URL from products.image_url
      // products.image_url is a full URL (e.g. https://bucket.storage.googleapis.com/path/to/file)
      // objectPath is just the path part - match both the path and the full URL pattern
      supabase.from('order_items').select('id', { count: 'exact', head: true }).or('product_image_url.eq.' + objectPath + ',product_image_url.ilike.' + '%' + objectPath),
    ]
    
    const results = await Promise.allSettled(checks.map(c => c.abortSignal(AbortSignal.timeout(TIMEOUT_MS))))
    
    return { 
      referenced: results.some(r => {
        if (r.status === 'rejected') return true
        const data = r.value
        if (data?.error) return true
        return (data?.count ?? 0) > 0
      })
    }
  } catch (err) {
    return { referenced: true, error: err instanceof Error ? err.message : String(err) }
  }
}

async function fileExistsInStorage(supabase: any, bucket: string, objectPath: string): Promise<'exists' | 'missing' | 'error'> {
  try {
    const dir = objectPath.substring(0, objectPath.lastIndexOf('/')) || ''
    const { data, error } = await supabase.storage.from(bucket).list(dir, { limit: 1000 }).abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    if (error) return 'error'
    const fileName = objectPath.substring(objectPath.lastIndexOf('/') + 1)
    return (data || []).some(f => f.name === fileName) ? 'exists' : 'missing'
  } catch {
    return 'error'
  }
}

async function releaseClaimOnError(supabase: any, orphanId: string, runId: string): Promise<void> {
  try {
    // Only release if still claimed by this runId (atomic fencing)
    const { data, error: updateError } = await supabase
      .from('storage_orphans')
      .update({ claimed_at: null, claimed_by: null })
      .eq('id', orphanId)
      .eq('claimed_by', runId)
      .select('id')
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    
    if (updateError) {
      throw new Error('Failed to release claim: ' + updateError.message)
    }
    if (!data || data.length === 0) {
      throw new Error('Claim already released by another process')
    }
  } catch (err) {
    console.error('Release claim error:', err instanceof Error ? err.message : String(err))
    throw err
  }
}

async function processOrphan(supabase: any, orphan: OrphanedImage, dryRun: boolean, runId: string): Promise<CleanupResult> {
  try {
    const refResult = await isFileReferenced(supabase, orphan.bucket, orphan.object_path)
    if (refResult.error) {
      if (!dryRun) {
        await releaseClaimOnError(supabase, orphan.id, runId)
      }
      return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'File reference check failed: ' + refResult.error }
    }
    if (refResult.referenced) {
      if (!dryRun) {
        await releaseClaimOnError(supabase, orphan.id, runId)
      }
      return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'File is still referenced' }
    }
    
    const fileStatus = await fileExistsInStorage(supabase, orphan.bucket, orphan.object_path)
    
    // Handle the three file states explicitly
    if (fileStatus === 'missing') {
      // File confirmed missing: mark cleaned without calling delete
      if (!dryRun) {
        const { error: markError } = await supabase
          .from('storage_orphans')
          .update({ cleaned_at: new Date().toISOString() })
          .eq('id', orphan.id)
          .eq('claimed_by', runId)
          .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
        if (markError) {
          await releaseClaimOnError(supabase, orphan.id, runId)
          return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'Failed to mark missing: ' + markError.message }
        }
      }
      return { status: 'missing', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path }
    }
    
    if (fileStatus === 'error') {
      // Error checking file: release claim, report error per file, do not mark cleaned_at
      if (!dryRun) {
        await releaseClaimOnError(supabase, orphan.id, runId)
      }
      return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'Failed to check file existence' }
    }
    
    // fileStatus === 'exists' - proceed with deletion
    if (!dryRun) {
      // Re-verify ownership before deletion (atomic fencing)
      const { data: ownershipCheck, error: ownershipError } = await supabase
        .from('storage_orphans')
        .select('id')
        .eq('id', orphan.id)
        .eq('claimed_by', runId)
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
      
      if (ownershipError || !ownershipCheck || ownershipCheck.length === 0) {
        return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'claim lost' }
      }
      
      try {
        await storageDelete(orphan.bucket, orphan.object_path)
      } catch (err) {
        await releaseClaimOnError(supabase, orphan.id, runId)
        return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'Storage delete failed: ' + (err instanceof Error ? err.message : String(err)) }
      }
      
      const { data: cleanedData, error: updateError } = await supabase
        .from('storage_orphans')
        .update({ cleaned_at: new Date().toISOString() })
        .eq('id', orphan.id)
        .eq('claimed_by', runId)
        .select('id')
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
      if (updateError || !cleanedData || cleanedData.length === 0) {
        if (!dryRun) {
          await releaseClaimOnError(supabase, orphan.id, runId)
        }
        return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'Failed to mark cleaned: ' + updateError.message }
      }
    }
    
    return { status: 'success', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path }
  } catch (err) {
    if (!dryRun) {
      await releaseClaimOnError(supabase, orphan.id, runId)
    }
    return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function cleanupImages(params: { dryRun: boolean; claimedBy: string }): Promise<{ stats: CleanupStats; results: CleanupResult[] }> {
  const runId = params.claimedBy + '_' + Date.now()
  try {
    const supabase = await createServiceClient()
    const orphans = await claimOrphans(supabase, params.dryRun, runId)
    
    const results: CleanupResult[] = []
    for (const orphan of orphans) {
      const result = await processOrphan(supabase, orphan, params.dryRun, runId)
      results.push(result)
    }
    
    const stats: CleanupStats = {
      total_eligible: orphans.length,
      claimed: params.dryRun ? 0 : orphans.length,
      cleaned: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      missing: results.filter(r => r.status === 'missing').length,
    }
    
    return { stats, results }
  } catch (err) {
    return { stats: { total_eligible: 0, claimed: 0, cleaned: 0, failed: 1, missing: 0 }, results: [] }
  }
}
