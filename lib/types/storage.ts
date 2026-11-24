/**
 * Storage configuration types for image cleanup
 */

export type StorageSetting = {
  key: string
  value: unknown
}

export type StorageSettingKey = 'imageCleanupRetentionDays' | 'imageCleanupBacklogVerifiedAt'
