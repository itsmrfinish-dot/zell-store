import 'server-only'

import { createAuthClient } from '../auth/supabaseServer'
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
const DEFAULT_RETENTION_DAYS = 30
const DEFAULT_BACKLOG_VERIFIED_AT = '2026-11-23'
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
    
    // Eligible if: created_at <= (now - retention) AND (created_at >= backlogVerifiedAt OR now >= backlogVerifiedAt + retention)
    const eligibleCreatedBefore = retentionDate.toISOString()
    const eligibleCreatedAfter = backlogDate.toISOString()
    const nowAfterBacklogPlus = backlogPlusRetention.getTime() <= now.getTime()
    
    if (dryRun) {
      const timeoutClaimed = new Date(Date.now() - CLAIM_TIMEOUT_MINUTES * 60000).toISOString()
      let query = supabase
        .from('storage_orphans')
        .select('id,bucket,object_path,created_at,claimed_at,claimed_by,cleaned_at')
        .is('cleaned_at', null)
        .lte('created_at', eligibleCreatedBefore)
      
      if (nowAfterBacklogPlus) {
        query = query.gte('created_at', eligibleCreatedAfter)
      } else {
        // No files eligible yet from backlog; skip this filter
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: true })
        .limit(1000)
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
      
      if (error) return []
      return (data || []).filter(r => r.claimed_at === null || new Date(r.claimed_at) < new Date(timeoutClaimed))
    }
    
    const timeoutClaimed = new Date(Date.now() - CLAIM_TIMEOUT_MINUTES * 60000).toISOString()
    
    // Atomic claim: SELECT + UPDATE in one transaction via UPDATE with conditions and RETURNING
    const { data: claimed, error } = await supabase
      .from('storage_orphans')
      .update({ claimed_at: new Date().toISOString(), claimed_by: claimedBy })
      .is('cleaned_at', null)
      .or('claimed_at.is.null,claimed_at.lt.' + timeoutClaimed)
      .lte('created_at', retentionDate.toISOString())
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

async function isFileReferenced(supabase: any, objectPath: string): Promise<boolean> {
  try {
    const checks = [
      supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('object_path', objectPath),
      supabase.from('site_images').select('id', { count: 'exact', head: true }).eq('object_path', objectPath),
    ]
    
    const results = await Promise.all(checks.map(c => c.abortSignal(AbortSignal.timeout(TIMEOUT_MS))))
    return results.some(r => !r.error && (r.count ?? 0) > 0)
  } catch {
    return true
  }
}

async function fileExistsInStorage(objectPath: string): Promise<boolean> {
  try {
    const response = await fetch(
      new URL(`/storage/v1/object/product-images/${encodeURIComponent(objectPath)}`, process.env.SUPABASE_URL).toString(),
      { method: 'HEAD', headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '', Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}` }, signal: AbortSignal.timeout(TIMEOUT_MS) }
    )
    return response.ok
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
    const isReferenced = await isFileReferenced(supabase, orphan.object_path)
    if (isReferenced) {
      if (!dryRun) {
        await releaseClaimOnError(supabase, orphan.id)
      }
      return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'File is still referenced' }
    }
    
    const exists = await fileExistsInStorage(orphan.object_path)
    
    if (!dryRun) {
      try {
        if (exists) {
          await storageDelete(orphan.object_path)
        }
      } catch (err) {
        await releaseClaimOnError(supabase, orphan.id)
        return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'Storage delete failed: ' + (err instanceof Error ? err.message : String(err)) }
      }
      
      await supabase.from('storage_orphans').update({ cleaned_at: 'now()' }).eq('id', orphan.id).abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    }
    
    return { status: exists ? 'success' : 'missing', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path }
  } catch (err) {
    if (!dryRun) {
      await releaseClaimOnError(supabase, orphan.id)
    }
    return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function cleanupImages(params: { dryRun: boolean; claimedBy: string }): Promise<{ stats: CleanupStats; results: CleanupResult[] }> {
  try {
    const supabase = await createAuthClient()
    const orphans = await claimOrphans(supabase, params.dryRun, params.claimedBy)
    
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
