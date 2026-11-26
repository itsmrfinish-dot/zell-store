'use client'

import type { StoreIdentity } from '../../lib/adminData'
import { Card } from '../ui/Field'
import { Switch } from '../ui/Switch'
import { saveIdentityAction } from '../../lib/actions'
import { useState } from 'react'

/**
 * Ø§ÙØªØ¨Ø¯ÙÙ Ø¨ÙÙ ØªÙØ¹ÙÙ/ØªØ¹Ø·ÙÙ ØµÙØ¯ÙÙ Ø·ÙØ¨ Ø§ÙÙØ¹Ø§ÙÙØ© ÙØ¨Ù Ø§ÙØªØ±ÙÙØ¨ Ø§ÙÙÙÙ.
 * 
 * - ON (Ø§ÙØ§ÙØªØ±Ø§Ø¶Ù): ÙØ¸ÙØ± Ø§ÙØµÙØ¯ÙÙ ÙÙ ØµÙØ­Ø© Ø§ÙÙÙØªØ¬ Ø¹ÙØ¯ Ø§Ø®ØªÙØ§Ø± Ø§ÙØªØ±ÙÙØ¨ Ø§ÙÙÙÙ
 * - OFF: ÙØ§ ÙØ¸ÙØ± Ø§ÙØµÙØ¯ÙÙ Ø®Ø§ÙØµØ ÙØ§ÙØ¹ÙÙÙ ÙØ§ ÙØ³ØªØ·ÙØ¹ Ø§Ø®ØªÙØ§Ø± Ø·ÙØ¨ Ø§ÙÙØ¹Ø§ÙÙØ©
 */
export function InspectionToggleCard({ identity, canSave }: { identity: StoreIdentity; canSave: boolean }) {
  const [isSaving, setIsSaving] = useState(false)
  const isEnabled = identity.inspectionEnabled !== false // Default is true

  const handleToggle = async (enabled: boolean) => {
    if (!canSave || isSaving) return

    setIsSaving(true)
    try {
      await saveIdentityAction({
        ...identity,
        inspectionEnabled: enabled,
      }, identity.updatedAt)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card
      title="Ø·ÙØ¨ Ø§ÙÙØ¹Ø§ÙÙØ© ÙØ¨Ù Ø§ÙØªØ±ÙÙØ¨"
    >
      <Switch
        checked={isEnabled}
        onChange={handleToggle}
        label={isEnabled ? 'ÙÙØ¹ÙÙ' : 'ÙØ¹Ø·ÙÙ'}
        disabled={!canSave || isSaving}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {isEnabled
          ? 'ØµÙØ¯ÙÙ Ø·ÙØ¨ Ø§ÙÙØ¹Ø§ÙÙØ© Ø¸Ø§ÙØ± ÙÙ ØµÙØ­Ø© Ø§ÙÙÙØªØ¬ Ø¹ÙØ¯ Ø§Ø®ØªÙØ§Ø± Ø§ÙØªØ±ÙÙØ¨ Ø§ÙÙÙÙ'
          : 'ØµÙØ¯ÙÙ Ø·ÙØ¨ Ø§ÙÙØ¹Ø§ÙÙØ© ÙØ®ØªÙÙ â Ø§ÙØ¹ÙÙÙ ÙÙ ÙØ³ØªØ·ÙØ¹ Ø§Ø®ØªÙØ§Ø± Ø·ÙØ¨ Ø§ÙÙØ¹Ø§ÙÙØ©'}
      </p>
    </Card>
  )
}
