import type { StoreIdentity } from '../../lib/adminData'
import { Card, Toggle } from '../ui/Field'
import { saveIdentityAction } from '../../lib/actions'
import { useState } from 'react'

/**
 * التبديل بين تفعيل/تعطيل صندوق طلب المعاينة قبل التركيب الفني.
 * 
 * - ON (الافتراضي): يظهر الصندوق في صفحة المنتج عند اختيار التركيب الفني
 * - OFF: لا يظهر الصندوق خالص، والعميل لا يستطيع اختيار طلب المعاينة
 * 
 * الأسعار: مفيش أي تغيير — العميل يشوف سعر واحد بس (سعر الفيلم بالمتر الطولي)
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
      title="طلب المعاينة قبل التركيب"
      description="اسمح للعميل باختيار طلب معاينة قبل التركيب الفني (تُظهر/تُخفي الصندوق)"
    >
      <Toggle
        label={isEnabled ? 'مفعّل' : 'معطّل'}
        checked={isEnabled}
        onChange={handleToggle}
        disabled={!canSave || isSaving}
      />
      <p className="mt-2 text-xs text-muted">
        {isEnabled
          ? 'صندوق طلب المعاينة ظاهر في صفحة المنتج عند اختيار التركيب الفني'
          : 'صندوق طلب المعاينة مختفي — العميل لن يستطيع اختيار طلب المعاينة'}
      </p>
    </Card>
  )
}
