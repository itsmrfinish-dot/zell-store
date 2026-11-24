/**
 * Type definitions for image cleanup storage operations
 */

export interface StorageSetting {
  key: string
  value: unknown
}

export type StorageSettingKey = 'imageCleanupRetentionDays' | 'imageCleanupBacklogVerifiedAt'
