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
    const eligibilityDate = new Date(Math.max(new Date(config.backlogVerifiedAt).getTime(), retentionDate.getTime()))
    
    if (dryRun) {
      const { data, error } = await supabase
        .from('storage_orphans')
        .select('id,bucket,object_path,created_at,claimed_at,claimed_by,cleaned_at')
        .is('cleaned_at', null)
        .or('claimed_at.is.null,claimed_at.lt.' + new Date(Date.now() - CLAIM_TIMEOUT_MINUTES * 60000).toISOString())
        .gte('created_at', eligibilityDate.toISOString())
        .order('created_at', { ascending: true })
        .limit(1000)
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
      return error ? [] : (data || [])
    }
    
    const timeoutClaimed = new Date(Date.now() - CLAIM_TIMEOUT_MINUTES * 60000).toISOString()
    const { data, error } = await supabase.rpc('claim_orphans_for_cleanup', {
      p_eligibility_date: eligibilityDate.toISOString(),
      p_timeout_claimed: timeoutClaimed,
      p_claimed_by: claimedBy
    }).abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    
    return error ? [] : (data || [])
  } catch {
    return []
  }
}

async function isFileReferenced(supabase: any, bucket: string, objectPath: string): Promise<boolean> {
  try {
    const checks = [
      supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('bucket', bucket).eq('object_path', objectPath),
      supabase.from('site_images').select('id', { count: 'exact', head: true }).eq('bucket', bucket).eq('object_path', objectPath),
      supabase.from('collections').select('id', { count: 'exact', head: true }).eq('cover_bucket', bucket).eq('cover_object_path', objectPath),
    ]
    
    const results = await Promise.all(checks.map(c => c.abortSignal(AbortSignal.timeout(TIMEOUT_MS))))
    return results.some(r => !r.error && (r.count ?? 0) > 0)
  } catch {
    return true
  }
}

async function fileExistsInStorage(supabase: any, bucket: string, objectPath: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(objectPath.split('/').slice(0, -1).join('/'), { limit: 1 }).abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    if (error) return true
    return data?.some(f => f.name === objectPath.split('/').pop()) ?? false
  } catch {
    return true
  }
}

async function processOrphan(supabase: any, orphan: OrphanedImage, dryRun: boolean): Promise<CleanupResult> {
  try {
    const isReferenced = await isFileReferenced(supabase, orphan.bucket, orphan.object_path)
    if (isReferenced) {
      if (!dryRun) {
        await supabase.from('storage_orphans').update({ claimed_at: null, claimed_by: null }).eq('id', orphan.id)
      }
      return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: 'File is still referenced' }
    }
    
    const exists = await fileExistsInStorage(supabase, orphan.bucket, orphan.object_path)
    
    if (!dryRun) {
      if (exists) {
        await storageDelete(orphan.bucket, orphan.object_path)
      }
      await supabase.from('storage_orphans').update({ cleaned_at: 'now()' }).eq('id', orphan.id)
    }
    
    return { status: exists ? 'success' : 'missing', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path }
  } catch (err) {
    if (!dryRun) {
      await supabase.from('storage_orphans').update({ claimed_at: null, claimed_by: null }).eq('id', orphan.id).catch(() => {})
    }
    return { status: 'failed', orphan_id: orphan.id, bucket: orphan.bucket, object_path: orphan.object_path, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function cleanupImages(params: { dryRun: boolean; claimedBy: string }): Promise<{ stats: CleanupStats; results: CleanupResult[] }> {
  try {
    const supabase = await createServiceClient()
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
