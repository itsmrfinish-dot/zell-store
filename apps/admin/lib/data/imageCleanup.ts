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
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key,value')
      .in('key', ['imageCleanupRetentionDays', 'imageCleanupBacklogVerifiedAt'])
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    
    if (error) return { retentionDays: DEFAULT_RETENTION_DAYS, backlogVerifiedAt: DEFAULT_BACKLOG_VERIFIED_AT }
    
    const config: Record<string, any> = {}
    for (const row of data || []) {
      if (row.key === 'imageCleanupRetentionDays') config.retentionDays = parseInt(row.value, 10) || DEFAULT_RETENTION_DAYS
      if (row.key === 'imageCleanupBacklogVerifiedAt') config.backlogVerifiedAt = row.value || DEFAULT_BACKLOG_VERIFIED_AT
    }
    return {
      retentionDays: config.retentionDays ?? DEFAULT_RETENTION_DAYS,
      backlogVerifiedAt: config.backlogVerifiedAt ?? DEFAULT_BACKLOG_VERIFIED_AT,
    }
  } catch {
    return { retentionDays: DEFAULT_RETENTION_DAYS, backlogVerifiedAt: DEFAULT_BACKLOG_VERIFIED_AT }
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
      
      if (error) return []
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
    
    if (error) return []
    return claimed || []
  } catch {
    return []
  }
}

async function isFileReferenced(supabase: any, bucket: string, objectPath: string): Promise<boolean> {
  try {
    const checks = [
      supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('object_path', objectPath),
      supabase.from('site_images').select('id', { count: 'exact', head: true }).eq('object_path', objectPath),
      supabase.from('collections').select('id', { count: 'exact', head: true }).eq('cover_bucket', bucket).eq('cover_object_path', objectPath),
      supabase.from('products').select('id', { count: 'exact', head: true }).or('images.cs.' + JSON.stringify([{ object_path: objectPath }]) + ',image_url.eq.' + objectPath + ',before_image.eq.' + objectPath + ',after_image.eq.' + objectPath),
      supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('product_image_url', objectPath),
    ]
    
    const results = await Promise.allSettled(checks.map(c => c.abortSignal(AbortSignal.timeout(TIMEOUT_MS))))
    return results.some(r => {
      if (r.status === 'rejected') return true
      const data = r.value
      if (data.error) return true
      return (data.count ?? 0) > 0
    })
  } catch {
    return true
  }
}

async function fileExistsInStorage(supabase: any, bucket: string, objectPath: string): Promise<boolean> {
  try {
    const dir = objectPath.substring(0, objectPath.lastIndexOf('/')) || ''
    const { data, error } = await supabase.storage.from(bucket).list(dir, { limit: 1000 }).abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    if (error) return true
    const fileName = objectPath.substring(objectPath.lastIndexOf('/') + 1)
    return (data || []).some(f => f.name === fileName)
  } catch {
    return true
  }
}

async function releaseClaimOnError(supabase: any, orphanId: string): Promise<void> {
  try {
    await supabase.from('storage_orphans').update({ claimed_at: null, claimed_by: null }).eq('id', orphanId).abortSignal(AbortSignal.timeout(TIMEOUT_MS))
  } catch {}
}

async function processOrphan(supabase: any, orphan: OrphanedImage, dryRun: boolean): Promise<CleanupResult> {
  try {
    const isReferenced = await isFileReferenced(supabase, orphan.bucket, orphan.object_path)
    if (isReferenced) {
      if (!dryRun) {
        await releaseClaimOnError(supabase, orphan.id, runId)
      }
      return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'File is still referenced' }
    }
    
    const exists = await fileExistsInStorage(supabase, orphan.bucket, orphan.object_path)
    
    if (!dryRun) {
      try {
        if (exists) {
          await storageDelete(orphan.object_path)
        }
      } catch (err) {
        await releaseClaimOnError(supabase, orphan.id, runId)
        return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'Storage delete failed: ' + (err instanceof Error ? err.message : String(err)) }
      }
      
      const { error: updateError } = await supabase
        .from('storage_orphans')
        .update({ cleaned_at: new Date().toISOString() })
        .eq('id', orphan.id)
        .eq('claimed_by', runId)
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
      if (updateError) {
        await releaseClaimOnError(supabase, orphan.id, runId)
        return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'Failed to mark cleaned: ' + updateError.message }
      }
    }
    
    return { status: exists ? 'success' : 'missing', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path }
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
      const result = await processOrphan(supabase, orphan, params.dryRun)
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
