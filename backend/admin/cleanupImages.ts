/** Server-side cleanup for orphaned storage files -- manual only, no scheduling */
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

const DEFAULT_RETENTION_DAYS = 30

export default async function cleanupImages(params: {
  dryRun: boolean
  claimedBy: string
}) {
  return { stats: {}, results: [] }
}
