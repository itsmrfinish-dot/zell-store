import { retoolDb } from '../lib/db'
import { getRetoolStorageClient } from '../lib/storage'

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

const DEFAULT_RETENTION_DAYS = 30
const DEFAULT_BACKLOG_VERIFIED_AT = '2026-11-23'

async function getCleanupConfig() {
  const rows = await retoolDb(
    'SELECT key, value FROM settings WHERE key IN (' + "'imageCleanupRetentionDays', 'imageCleanupBacklogVerifiedAt'" + ')'
  )
  const config: Record<string, any> = {}
  for (const row of rows) {
    if (row.key === 'imageCleanupRetentionDays') {
      config.retentionDays = parseInt(row.value, 10) || DEFAULT_RETENTION_DAYS
    }
    if (row.key === 'imageCleanupBacklogVerifiedAt') {
      config.backlogVerifiedAt = row.value || DEFAULT_BACKLOG_VERIFIED_AT
    }
  }
  return {
    retentionDays: config.retentionDays ?? DEFAULT_RETENTION_DAYS,
    backlogVerifiedAt: config.backlogVerifiedAt ?? DEFAULT_BACKLOG_VERIFIED_AT,
  }
}

async function claimOrphans(claimedBy: string): Promise<OrphanedImage[]> {
  const config = await getCleanupConfig()
  const retentionDate = new Date()
  retentionDate.setDate(retentionDate.getDate() - config.retentionDays)
  const eligibilityDate = new Date(
    Math.max(
      new Date(config.backlogVerifiedAt).getTime(),
      retentionDate.getTime()
    )
  )
  const orphans = await retoolDb(
    'SELECT id, bucket, object_path, created_at, claimed_at, claimed_by, cleaned_at FROM storage_orphans WHERE cleaned_at IS NULL AND claimed_at IS NULL AND GREATEST(created_at, ' + eligibilityDate.toISOString() + '::timestamptz) < ' + retentionDate.toISOString() + '::timestamptz ORDER BY created_at ASC FOR UPDATE SKIP LOCKED'
  )
  if (orphans.length === 0) return []
  const ids = orphans.map(o => o.id)
  await retoolDb(
    'UPDATE storage_orphans SET claimed_at = NOW(), claimed_by = ' + claimedBy + ' WHERE id = ANY(' + JSON.stringify(ids) + ')'
  )
  return orphans
}

export default async function cleanupImages(params: { dryRun: boolean; claimedBy: string }) {
  const orphans = await claimOrphans(params.claimedBy)
  const results: CleanupResult[] = []
  const stats: CleanupStats = {
    total_eligible: orphans.length,
    claimed: orphans.length,
    cleaned: 0,
    failed: 0,
    missing: 0,
  }
  return { stats, results }
}
