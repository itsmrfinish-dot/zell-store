'use clien

      <div>
        <label className="block text-sm font-medium mb-2">الرسالة - الواتساب</label>
        <textarea
          value={values.whatsappMessage || ''}
          onChange={(e) => setFieldValue('whatsappMessage', e.target.value)}
          placeholder="قالب الواتساب"
          className="w-full border rounded px-3 py-2 font-mono text-sm"
          rows={6}
          maxLength={INSTALLATION_LIMITS.whatsappMessage}
        />
        <div className="text-xs text-gray-500 mt-1">
          ({values.whatsappMessage?.length || 0} / {INSTALLATION_LIMITS.whatsappMessage})
        </div>
      </div>t'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DEFAULT_INSPECTION_NOTE, INSTALLATION_LIMITS, type InstallationAreas, type InstallationMode } from '@zell/core'
import { saveInstallationAction } from '../../lib/actions'
import { useSaveAction } from '../../lib/client/useSaveAction'
import { formatPiastres, piastresToPounds } from '../../lib/format'
import type { InstallationInput } from '../../lib/mutations/installation'
import type { InstallationFilm, InstallationRecord, ShippingAreaGroup } from '../../lib/data/installation'
import { useMutationsEnabled } from '../../lib/readiness'
import { Button } from '../ui/Button'
import { FailureBanner } from '../ui/FailureBanner'
import { Card, Field, inputClasses, textareaClasses } from '../ui/Field'
import { SaveBar } from '../ui/SaveBar'
import { Switch } from '../ui/Switch'

/** Ø§ÙÙØ³ÙØ¯Ø© Ø¨Ø§ÙØ¬ÙÙÙ ÙÙØµ Ø²Ù ÙØ§ Ø§ÙØ£Ø¯ÙÙ Ø¨ÙÙØªØ¨. Ø§ÙÙÙØ·ÙØ© Ø§ÙÙÙØ¹ÙÙØ© = ÙÙØ¬ÙØ¯Ø© ÙÙ areas. */
type Draft = {
  enabled: boolean
  note: string
  inspectionNote: string
  fee: string
  areas: Record<string, Record<string, string>>
  /** INSTALLER-ONLY */
  mode: InstallationMode
  productIds: number[]
}

const MAX_POUNDS = INSTALLATION_LIMITS.maxPiastres / 100

/** INSTALLER-ONLY (ÙØ±Ø§Ø± Ø§ÙÙØ§ÙÙ 2026-11-05) â Ø·Ø±ÙÙØ© Ø§ÙØªØ±ÙÙØ¨. */
const MODE_OPTIONS: Array<{ value: InstallationMode; title: string; hint: string }> = [
  { value: 'choice', title: 'Ø§ÙØ¹ÙÙÙ ÙØ®ØªØ§Ø±', hint: 'Ø§ÙÙØ¶Ø¹ Ø§ÙØ­Ø§ÙÙ: ÙØ®ØªØ§Ø± Ø§ÙØ¹ÙÙÙ Ø¨ÙÙ Â«ÙØ±ÙÙØ¨Ù Ø¨ÙÙØ³ÙÂ» ÙÂ«ÙØ­ØªØ§Ø¬ ÙÙÙ ØªØ±ÙÙØ¨Â».' },
  { value: 'installer_all', title: 'ÙÙÙ ÙÙØ· â ÙÙ Ø§ÙÙÙØªØ¬Ø§Øª', hint: 'ØªÙØ±ÙÙÙØ¨ Ø¬ÙÙØ¹ Ø£ÙÙØ§Ù Ø§ÙÙÙØ§Ø³ Ø¨ÙØ§Ø³Ø·Ø© ÙÙÙ ÙÙØ·.' },
  { value: 'installer_products', title: 'ÙÙÙ ÙÙØ· â ÙÙØªØ¬Ø§Øª ÙØ­Ø¯Ø¯Ø©', hint: 'Ø§Ø®ØªØ± Ø§ÙÙÙØªØ¬Ø§Øª ÙÙ Ø§ÙÙØ§Ø¦ÙØ© Ø£Ø¯ÙØ§Ù.' },
]

/** Â«100Â» Ø£Ù Â«99.5Â» â ÙØ±Ø´. ÙØ§Ø¶Ù Â· Ø³Ø§ÙØ¨ Â· Ø£ÙØªØ± ÙÙ Ø±ÙÙÙÙ Ø¹Ø´Ø±ÙÙÙ Â· ÙÙÙ Ø§ÙØ­Ø¯ = null. */
function toPiastres(text: string, min: 0 | 1): number | null {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return null
  const piastres = Math.round(value * 100)
  if (Math.abs(piastres - value * 100) > 1e-6) return null
  if (piastres < min || piastres > INSTALLATION_LIMITS.maxPiastres) return null
  return piastres
}

/** Ø§ÙÙÙØ§Ø·Ù Ø§ÙÙÙ Ø§ØªØ´Ø§ÙØª ÙÙ Ø§ÙØ´Ø­Ù ÙØ§Ø¨ØªØ¯Ø®ÙØ´ Ø§ÙÙØ³ÙØ¯Ø© â Ø¨ØªØªØ´Ø§Ù ÙÙ Ø§ÙØ¥Ø¹Ø¯Ø§Ø¯ ÙØ¹ Ø£ÙÙ Ø­ÙØ¸. */
function toDraft(record: InstallationRecord, groups: ShippingAreaGroup[]): Draft {
  const areas: Draft['areas'] = {}
  for (const group of groups) {
    const saved = record.config.areas[group.governorate] ?? {}
    const out: Record<string, string> = {}
    for (const area of group.areas) {
      const travel = saved[area]
      if (travel !== undefined) out[area] = piastresToPounds(travel)
    }
    if (Object.keys(out).length > 0) areas[group.governorate] = out
  }
  const fee = record.config.feePerMeterPiastres
  return {
    enabled: record.config.enabled,
    note: record.config.note,
    inspectionNote: record.config.inspectionNote ?? DEFAULT_INSPECTION_NOTE,
    fee: fee === null ? '' : piastresToPounds(fee),
    areas,
    mode: record.config.mode ?? 'choice',
    productIds: record.config.installerOnlyProductIds ?? [],
  }
}

function orphansOf(areas: InstallationAreas, groups: ShippingAreaGroup[]): string[] {
  const shipping = new Map(groups.map((group) => [group.governorate, group.areas]))
  const out: string[] = []
  for (const [governorate, list] of Object.entries(areas)) {
    const known = shipping.get(governorate) ?? []
    for (const area of Object.keys(list)) if (!known.includes(area)) out.push(area + ' (' + governorate + ')')
  }
  return out
}

type Checked = { ok: true; input: InstallationInput } | { ok: false; error: string }

function validate(draft: Draft): Checked {
  const feeText = draft.fee.trim()
  const fee = feeText === '' ? null : toPiastres(feeText, 1)
  if (feeText !== '' && fee === null) {
    return { ok: false, error: 'Ø³Ø¹Ø± ØªØ±ÙÙØ¨ Ø§ÙÙØªØ± ÙØ§Ø²Ù ÙÙÙÙ Ø±ÙÙ ÙÙ 0.01 ÙÙ ' + String(MAX_POUNDS) + ' Ø¬ÙÙÙ' }
  }
  const areas: InstallationAreas = {}
  let count = 0
  for (const [governorate, list] of Object.entries(draft.areas)) {
    const out: Record<string, number> = {}
    for (const [area, text] of Object.entries(list)) {
      const travel = toPiastres(text, 0)
      if (travel === null) {
        return { ok: false, error: 'Ø§ÙØªØ¨ Ø§ÙØªÙØ§Ù Ø§ÙÙÙÙ ÙÙÂ«' + area + 'Â» (' + governorate + ') â ØµÙØ± = Ø§ÙØªÙØ§Ù ÙØ¬Ø§ÙÙ' }
      }
      out[area] = travel
      count += 1
    }
    if (Object.keys(out).length > 0) areas[governorate] = out
  }
  if (fee === null && (draft.enabled || count > 0)) return { ok: false, error: 'Ø§ÙØªØ¨ Ø³Ø¹Ø± ØªØ±ÙÙØ¨ Ø§ÙÙØªØ±' }
  if (draft.mode === 'installer_products' && draft.productIds.length === 0) {
    return { ok: false, error: 'ÙÙØ±Ø¬Ù Ø§Ø®ØªÙØ§Ø± ÙÙØªØ¬ ÙØ§Ø­Ø¯ Ø¹ÙÙ Ø§ÙØ£ÙÙ ÙØ®ÙØ§Ø± Â«ÙÙÙ ÙÙØ· â ÙÙØªØ¬Ø§Øª ÙØ­Ø¯Ø¯Ø©Â».' }
  }
  return {
    ok: true,
    input: { enabled: draft.enabled, note: draft.note, inspectionNote: draft.inspectionNote, feePerMeterPiastres: fee, areas, mode: draft.mode, installerOnlyProductIds: draft.productIds },
  }
}

/**
 * ÙÙÙ Ø§ÙØªØ±ÙÙØ¨: Ø§ÙØªØ´ØºÙÙ Â· Ø³Ø¹Ø± ØªØ±ÙÙØ¨ Ø§ÙÙØªØ± Â· Ø§ÙÙÙØ§Ø·Ù Ø§ÙÙØªØ§Ø­Ø© ÙØ§ÙØªÙØ§Ù ÙÙ ÙÙØ·ÙØ©.
 *
 * â ï¸ Ø£Ø³ÙØ§Ø¡ Ø§ÙÙÙØ§Ø·Ù Ø¬Ø§ÙØ© ÙÙ ØµÙØ­Ø© Ø§ÙØ´Ø­Ù Ø¨Ø³ â ÙÙÙØ´ Ø®Ø§ÙØ© ÙÙØªØ§Ø¨Ø© Ø§Ø³Ù.
 * â ï¸ Ø§ÙØ·Ø§Ø¨Ø¹ (updated_at) Ø¨ÙØªØ­Ø¯ÙØ« ÙÙ Ø±Ø¯ Ø§ÙØ­ÙØ¸. Â«ØªØ¬Ø§ÙÙ ÙØ­Ø¯ÙØ«Â» Ø¨ÙØ¹ÙÙ refreshØ
 *    ÙØ§ÙØµÙØ­Ø© Ø¨ØªØ±ÙÙØ¨ Ø§ÙÙØ­Ø±Ø± ÙÙ Ø¬Ø¯ÙØ¯ Ø¨Ù key = Ø§ÙØ·Ø§Ø¨Ø¹.
 * â ï¸ Ø§ÙØ­Ø³Ø§Ø¨ ÙÙØ³Ù ÙÙ Ø§ÙØ¯Ø§ØªØ§Ø¨ÙØ² (zell_create_order) â ÙÙØ§ Ø¥Ø¹Ø¯Ø§Ø¯ Ø¨Ø³.
 */
export function InstallationEditor({
  initial,
  groups,
  films,
}: {
  initial: InstallationRecord
  groups: ShippingAreaGroup[]
  films: InstallationFilm[]
}) {
  const router = useRouter()
  const mutationsOn = useMutationsEnabled()
  const { state, failure, warning, run, retry, markDirty } = useSaveAction()
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial, groups))
  const draftRef = useRef(draft)
  draftRef.current = draft
  const stampRef = useRef<string | null>(initial.updatedAt)
  const [savedAreas, setSavedAreas] = useState<InstallationAreas>(initial.config.areas)
  const [bulk, setBulk] = useState<Record<string, string>>({})
  const [localError, setLocalError] = useState<string | null>(null)

  const busy = state === 'saving'
  const locked = !mutationsOn || busy

  const update = (change: (current: Draft) => Draft) => {
    setDraft(change)
    setLocalError(null)
    markDirty()
  }

  function toggleArea(governorate: string, area: string, on: boolean) {
    update((current) => {
      const list = { ...(current.areas[governorate] ?? {}) }
      if (on) list[area] = list[area] ?? ''
      else delete list[area]
      const areas = { ...current.areas }
      if (Object.keys(list).length > 0) areas[governorate] = list
      else delete areas[governorate]
      return { ...current, areas }
    })
  }

  function setTravel(governorate: string, area: string, text: string) {
    update((current) => ({
      ...current,
      areas: { ...current.areas, [governorate]: { ...(current.areas[governorate] ?? {}), [area]: text } },
    }))
  }

  function enableAll(governorate: string, areas: string[]) {
    const text = (bulk[governorate] ?? '').trim()
    if (toPiastres(text, 0) === null) {
      setLocalError('Ø§ÙØªØ¨ Ø³Ø¹Ø± Ø§ÙØªÙØ§Ù ØµØ­ÙØ­ ÙÙ' + governorate + ' ÙØ¨Ù Â«ÙØ¹ÙÙ Ø§ÙÙÙÂ» â ØµÙØ± = ÙØ¬Ø§ÙÙ')
      return
    }
    update((current) => ({ ...current, areas: { ...current.areas, [governorate]: Object.fromEntries(areas.map((area) => [area, text])) } }))
  }

  function disableAll(governorate: string) {
    update((current) => {
      const areas = { ...current.areas }
      delete areas[governorate]
      return { ...current, areas }
    })
  }

  function toggleProduct(id: number, on: boolean) {
    update((current) => ({
      ...current,
      productIds: on
        ? current.productIds.includes(id)
          ? current.productIds
          : [...current.productIds, id]
        : current.productIds.filter((item) => item !== id),
    }))
  }

  function save() {
    const checked = validate(draftRef.current)
    if (!checked.ok) {
      setLocalError(checked.error)
      return
    }
    setLocalError(null)
    const input = checked.input
    const expected = stampRef.current
    void run(() => saveInstallationAction(input, expected), {
      onSuccess: (saved) => {
        stampRef.current = saved.updatedAt
        setSavedAreas(saved.config.areas)
        setDraft(toDraft(saved, groups))
      },
    })
  }

  const withAreas = groups.filter((group) => group.areas.length > 0)
  const withoutAreas = groups.filter((group) => group.areas.length === 0)
  const orphans = orphansOf(savedAreas, groups)
  const enabledAreas = Object.values(draft.areas).reduce((sum, list) => sum + Object.keys(list).length, 0)
  const enabledGovernorates = Object.keys(draft.areas).length
  const fee = toPiastres(draft.fee, 1)

  const status = !draft.enabled
    ? { tone: 'text-muted', text: 'ÙØªÙÙÙ â Ø®ÙØ§Ø± Ø§ÙÙÙÙ ÙØ´ Ø¸Ø§ÙØ± ÙÙØ²Ø¨ÙÙ.' }
    : fee === null
      ? { tone: 'text-gold', text: 'ÙÙØ±Ø¬Ù Ø¥Ø¯Ø®Ø§Ù Ø³Ø¹Ø± ØªØ±ÙÙØ¨ Ø§ÙÙØªØ±Ø Ø¨Ø¯ÙÙÙ ÙØ§ ØªØªÙÙØ± Ø®Ø¯ÙØ© Ø§ÙØªØ±ÙÙØ¨ ÙÙ Ø£Ù ÙÙØ·ÙØ©.' }
      : enabledAreas === 0
        ? { tone: 'text-gold', text: 'ÙØ§ ØªÙØ¬Ø¯ ÙÙØ·ÙØ© ÙÙØ¹ÙÙØ©Ø ÙØ°ÙÙ ÙØ§ ØªØªÙÙØ± Ø®Ø¯ÙØ© Ø§ÙØªØ±ÙÙØ¨ ÙÙ Ø£Ù ÙÙØ·ÙØ©.' }
        : {
            tone: 'text-ok',
            text:
              'ÙØªØ§Ø­ ÙÙ ' + String(enabledAreas) + ' ÙÙØ·ÙØ© ÙÙ ' + String(enabledGovernorates) + ' ÙØ­Ø§ÙØ¸Ø© â ' +
              formatPiastres(fee) + ' ÙÙÙØªØ± + Ø§ÙØªÙØ§Ù Ø­Ø³Ø¨ Ø§ÙÙÙØ·ÙØ©.',
          }

  return (
    <div className="space-y-4">
      <Card title="Ø§ÙØ®Ø¯ÙØ©">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg">ØªØ´ØºÙÙ ÙÙÙ Ø§ÙØªØ±ÙÙØ¨</p>
              <p className="text-xs text-muted">ÙØ¸ÙØ± ÙÙØ¹ÙÙÙ ÙÙ Ø§ÙÙÙØ§Ø·Ù Ø§ÙÙÙØ¹ÙÙØ© Ø£Ø¯ÙØ§Ù ÙÙØ·.</p>
            </div>
            <Switch
              checked={draft.enabled}
              onChange={(next) => update((current) => ({ ...current, enabled: next }))}
              label="ØªØ´ØºÙÙ ÙÙÙ Ø§ÙØªØ±ÙÙØ¨"
              disabled={locked}
            />
          </div>
          <p className={'border-t border-border pt-2 text-xs font-semibold ' + status.tone}>{status.text}</p>

          <Field
            htmlFor="installation-fee"
            label="Ø³Ø¹Ø± ØªØ±ÙÙØ¨ Ø§ÙÙØªØ± Ø§ÙØ·ÙÙÙ (Ø¬.Ù)"
            hint={
              'ÙÙØ­Ø³Ø¨ Ø¹ÙÙ ÙØ¬ÙÙØ¹ Ø£Ø·ÙØ§Ù Ø§ÙÙÙØªØ¬Ø§Øª Ø§ÙÙØ¨ÙØ¹Ø© Ø¨Ø§ÙÙÙØ§Ø³ ÙÙ Ø§ÙØ·ÙØ¨Ø ÙÙØ§ ØªØ¯Ø®Ù ÙÙÙ Ø§ÙÙÙØªØ¬Ø§Øª Ø§ÙÙØ¨ÙØ¹Ø© Ø¨Ø§ÙØ¹Ø¯Ø¯.' +
              (fee === null ? '' : ' ÙØ«Ø§Ù: ÙÙÙÙ 5 ÙØªØ± = ' + formatPiastres(fee * 5) + ' ØªØ±ÙÙØ¨.')
            }
          >
            <input
              id="installation-fee"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={draft.fee}
              onChange={(event) => update((current) => ({ ...current, fee: event.target.value }))}
              className={inputClasses}
              placeholder="100"
              disabled={locked}
            />
          </Field>

          <Field htmlFor="installation-note" label="Ø³Ø·Ø± Ø§ÙØªÙØ¶ÙØ­ (Ø§Ø®ØªÙØ§Ø±Ù)" hint="Ø¨ÙØ¸ÙØ± ØªØ­Øª Ø®ÙØ§Ø± Ø§ÙÙÙÙ ÙÙ ØµÙØ­Ø© Ø§ÙØ·ÙØ¨.">
            <textarea
              id="installation-note"
              value={draft.note}
              onChange={(event) => update((current) => ({ ...current, note: event.target.value }))}
              className={textareaClasses}
              rows={2}
              maxLength={INSTALLATION_LIMITS.note}
              placeholder="Ø§ÙØªØ¨ Ø³Ø·Ø± Ø§ÙØªÙØ¶ÙØ­"
              disabled={locked}
            />
          </Field>

          <Field htmlFor="installation-inspection-note" label="Ø±Ø³Ø§ÙØ© Ø§ÙÙØ¹Ø§ÙÙØ©" hint="Ø¨ØªØ¸ÙØ± ÙÙØ¹ÙÙÙ ÙÙ ØµÙØ­Ø© Ø§ÙÙÙØªØ¬ ÙÙØ§ ÙØ®ØªØ§Ø± Ø§ÙØªØ±ÙÙØ¨ Ø§ÙÙÙÙØ ÙØ¨ØªØªØ¨Ø¹Øª ÙØ¹ Ø·ÙØ¨ Ø§ÙÙØ¹Ø§ÙÙØ© Ø¹ÙÙ ÙØ§ØªØ³Ø§Ø¨.">
            <textarea
              id="installation-inspection-note"
              value={draft.inspectionNote}
              onChange={(event) => update((current) => ({ ...current, inspectionNote: event.target.value }))}
              className={textareaClasses}
              rows={3}
              maxLength={INSTALLATION_LIMITS.inspectionNote}
              placeholder="Ø§ÙØªØ¨ Ø±Ø³Ø§ÙØ© Ø§ÙÙØ¹Ø§ÙÙØ©"
              disabled={locked}
            />
          </Field>
        </div>
      </Card>

      {/* INSTALLER-ONLY (ÙØ±Ø§Ø± Ø§ÙÙØ§ÙÙ 2026-11-05) â Ø·Ø±ÙÙØ© Ø§ÙØªØ±ÙÙØ¨: Ø§ÙØ¹ÙÙÙ ÙØ®ØªØ§Ø± Â· ÙÙÙ ÙÙØ· ÙÙÙ Ø§ÙÙÙØªØ¬Ø§Øª Â· ÙÙÙØªØ¬Ø§Øª ÙØ¹ÙÙØ© */}
      <Card title="Ø·Ø±ÙÙØ© Ø§ÙØªØ±ÙÙØ¨">
        <div className="space-y-3">
          <p className="text-xs text-muted">
            Ø¹ÙØ¯ Ø§Ø®ØªÙØ§Ø± Â«ÙÙÙ ÙÙØ·Â» ÙÙØ®ÙÙ Ø®ÙØ§Ø± Â«ÙØ±ÙÙØ¨Ù Ø¨ÙÙØ³ÙÂ» ÙØ§ÙØªØ±Ø§Ø­Ø§Øª Ø§ÙØ£Ø¯ÙØ§Øª ÙÙ ØµÙØ­Ø© Ø§ÙÙÙØªØ¬Ø ÙÙØµØ¨Ø­ Ø§ÙØ·ÙØ¨ ÙÙÙ Ø¨ÙÙÙ. Ø¥Ø°Ø§ ÙÙ ØªØªÙÙØ±
            Ø®Ø¯ÙØ© Ø§ÙØªØ±ÙÙØ¨ ÙÙ ÙÙØ·ÙØ© Ø§ÙØ¹ÙÙÙØ ÙÙØ³ØªÙÙÙ Ø§ÙØ·ÙØ¨ Ø¯ÙÙ ÙÙÙ ÙÙØ§ ÙÙ Ø§ÙØ­Ø§Ù Ø§ÙØ¢Ù. ÙÙØ¹ÙØ¯Ø© Ø¥ÙÙ Ø§ÙÙØ¶Ø¹ Ø§ÙÙØ¹ØªØ§Ø¯ Ø§Ø®ØªØ± Â«Ø§ÙØ¹ÙÙÙ ÙØ®ØªØ§Ø±Â» Ø«Ù Ø§Ø­ÙØ¸.
          </p>
          <div role="radiogroup" aria-label="Ø·Ø±ÙÙØ© Ø§ÙØªØ±ÙÙØ¨" className="grid gap-2">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={
                  'flex cursor-pointer items-start gap-2.5 rounded-lg border-2 p-3 text-sm ' +
                  (draft.mode === option.value ? 'border-brand bg-brand/5' : 'border-border')
                }
              >
                <input
                  type="radio"
                  name="installation-mode"
                  value={option.value}
                  checked={draft.mode === option.value}
                  onChange={() => update((current) => ({ ...current, mode: option.value }))}
                  disabled={locked}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-fg">{option.title}</span>
                  <span className="block text-xs text-muted">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {draft.mode === 'installer_products' ? (
            films.length === 0 ? (
              <p className="text-xs text-muted">ÙØ§ ØªÙØ¬Ø¯ Ø£ÙÙØ§Ù ØªÙØ¨Ø§Ø¹ Ø¨Ø§ÙÙÙØ§Ø³.</p>
            ) : (
              <fieldset className="space-y-1 rounded-lg border border-border p-3">
                <legend className="px-1 text-xs font-semibold text-fg">
                  Ø§ÙÙÙØªØ¬Ø§Øª Ø§ÙØªÙ ØªÙØ±ÙÙÙØ¨ Ø¨ÙØ§Ø³Ø·Ø© ÙÙÙ ÙÙØ· ({String(draft.productIds.length)})
                </legend>
                <ul className="max-h-72 space-y-1 overflow-y-auto">
                  {films.map((film) => (
                    <li key={film.id}>
                      <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-fg">
                        <input
                          type="checkbox"
                          checked={draft.productIds.includes(film.id)}
                          onChange={(event) => toggleProduct(film.id, event.target.checked)}
                          disabled={locked}
                          className="h-4 w-4 shrink-0 accent-brand"
                        />
                        <span>{film.name}</span>
                        {film.isActive ? null : <span className="text-xs text-muted">(ÙØ®ÙÙ)</span>}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )
          ) : null}

          {draft.mode !== 'choice' && (!draft.enabled || fee === null || enabledAreas === 0) ? (
            <p className="text-xs font-semibold text-gold">
              ÙÙ ÙØ¹ÙÙ Â«ÙÙÙ ÙÙØ·Â» Ø¥ÙØ§ Ø¥Ø°Ø§ ÙØ§ÙØª Ø®Ø¯ÙØ© Ø§ÙØªØ±ÙÙØ¨ ÙÙØ¹ÙÙØ© ÙÙÙØ§ Ø³Ø¹Ø± ÙØªØ± ÙÙÙØ·ÙØ© ÙÙØ¹ÙÙØ© ÙØ§Ø­Ø¯Ø© Ø¹ÙÙ Ø§ÙØ£ÙÙØ ÙØ­ØªÙ Ø°ÙÙ Ø§ÙØ­ÙÙ ÙØ®ØªØ§Ø± Ø§ÙØ¹ÙÙÙ ÙØ§ÙÙØ¹ØªØ§Ø¯.
            </p>
          ) : null}
        </div>
      </Card>

      {orphans.length > 0 ? (
        <div className="rounded-lg border-2 border-gold bg-gold/10 p-3 text-xs text-fg">
          <p className="font-bold">ÙÙØ§Ø·Ù ÙØ§ÙØª ÙØªØ§Ø­Ø© ÙÙÙÙÙ ÙÙØ§Ø¨ÙØªØ´ ÙÙØ¬ÙØ¯Ø© ÙÙ Ø§ÙØ´Ø­Ù</p>
          <p className="mt-1">{orphans.join('Ø ')}</p>
          <p className="mt-1 text-muted">
            Ø­ÙØ°ÙØª Ø£Ù ØªØºÙÙØ± Ø§Ø³ÙÙØ§ ÙÙ ØµÙØ­Ø© Ø§ÙØ´Ø­ÙØ ÙØ°ÙÙ Ø®Ø¯ÙØ© Ø§ÙØªØ±ÙÙØ¨ ØºÙØ± ÙØªØ§Ø­Ø© ÙÙÙØ§ Ø­Ø§ÙÙÙØ§. Ø³ØªÙØ²Ø§Ù ÙÙ ÙÙØ§ Ø¹ÙØ¯ Ø§ÙØ­ÙØ¸ Ø§ÙØªØ§ÙÙØ ÙØ¥Ø°Ø§ ØªØºÙÙØ± Ø§ÙØ§Ø³Ù ÙÙØ±Ø¬Ù ØªÙØ¹ÙÙ Ø§ÙØ§Ø³Ù Ø§ÙØ¬Ø¯ÙØ¯ Ø£Ø¯ÙØ§Ù.
          </p>
        </div>
      ) : null}

      {withAreas.length === 0 ? (
        <Card title="Ø§ÙÙÙØ§Ø·Ù">
          <p className="text-xs text-muted">
            ÙÙÙØ´ ÙÙØ§Ø·Ù ÙÙ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§ÙØ´Ø­Ù. Ø¶ÙÙ ÙÙØ§Ø·Ù ÙÙ ÙØ­Ø§ÙØ¸Ø© ÙÙ{' '}
            <Link href="/shipping" className="font-semibold text-accent">
              ØµÙØ­Ø© Ø§ÙØ´Ø­Ù
            </Link>{' '}
            Ø§ÙØ£ÙÙØ ÙØ¨Ø¹Ø¯ÙÙ ÙØ¹ÙÙÙØ§ ÙÙØ§.
          </p>
        </Card>
      ) : null}

      {withAreas.map((group, groupIndex) => {
        const list = draft.areas[group.governorate] ?? {}
        const active = Object.keys(list).length
        const bulkId = 'installation-bulk-' + String(groupIndex)
        return (
          <Card key={group.governorate} title={group.governorate + ' (' + String(active) + '/' + String(group.areas.length) + ')'}>
            {group.shippingDisabled ? (
              <p className="mb-2 text-xs font-semibold text-gold">
                Ø§ÙØ´Ø­Ù ÙÙØ°Ù Ø§ÙÙØ­Ø§ÙØ¸Ø© ÙØªÙÙÙØ ÙØªÙØ±ÙØ¶ Ø§ÙØ·ÙØ¨Ø§Øª ÙÙÙØ§ Ø­ØªÙ ÙÙØ¹Ø§Ø¯ ØªØ´ØºÙÙÙ ÙÙ ØµÙØ­Ø© Ø§ÙØ´Ø­Ù.
              </p>
            ) : null}
            <div className="mb-3 flex flex-wrap items-end gap-2">
              <Field htmlFor={bulkId} label="ÙØ¹ÙÙ ÙÙ Ø§ÙÙÙØ§Ø·Ù Ø¨Ø§ÙØªÙØ§Ù (Ø¬.Ù)">
                <input
                  id={bulkId}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={bulk[group.governorate] ?? ''}
                  onChange={(event) => setBulk((current) => ({ ...current, [group.governorate]: event.target.value }))}
                  className={inputClasses + ' w-32'}
                  placeholder="0"
                  disabled={locked}
                />
              </Field>
              <Button variant="secondary" size="sm" disabled={locked} onClick={() => enableAll(group.governorate, group.areas)}>
                ÙØ¹ÙÙ Ø§ÙÙÙ
              </Button>
              <Button variant="ghost" size="sm" disabled={locked || active === 0} onClick={() => disableAll(group.governorate)}>
                Ø§ÙÙÙ Ø§ÙÙÙ
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {group.areas.map((area, areaIndex) => {
                const travel = list[area]
                const on = travel !== undefined
                const travelId = 'installation-travel-' + String(groupIndex) + '-' + String(areaIndex)
                return (
                  <li key={area} className="flex flex-wrap items-center gap-3 py-2">
                    <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-fg">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(event) => toggleArea(group.governorate, area, event.target.checked)}
                        disabled={locked}
                        className="h-4 w-4 shrink-0 accent-brand"
                      />
                      <span className="truncate">{area}</span>
                    </label>
                    {on ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          id={travelId}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.01"
                          value={travel}
                          onChange={(event) => setTravel(group.governorate, area, event.target.value)}
                          className={inputClasses + ' w-28'}
                          placeholder="0"
                          aria-label={'Ø§ÙØªÙØ§Ù Ø§ÙÙÙÙ ÙÙ' + area}
                          disabled={locked}
                        />
                        <span className="text-xs text-muted">Ø¬ Ø§ÙØªÙØ§Ù</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">ÙØ´ ÙØªØ§Ø­</span>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-xs text-muted">Ø§ÙØ§ÙØªÙØ§Ù Ø¨ÙØªØ­Ø³Ø¨ ÙØ±Ø© ÙØ§Ø­Ø¯Ø© ÙÙØ·ÙØ¨ ÙÙÙØ§ ÙØ§Ù Ø¹Ø¯Ø¯ Ø§ÙØ£ÙÙØ§Ù â ØµÙØ± = ÙØ¬Ø§ÙÙ.</p>
          </Card>
        )
      })}

      {withoutAreas.length > 0 && withAreas.length > 0 ? (
        <p className="text-xs text-muted">
          ÙØ­Ø§ÙØ¸Ø§Øª ÙÙ ØºÙØ± ÙÙØ§Ø·Ù ÙÙ Ø§ÙØ´Ø­Ù (Ø§ÙÙÙÙ ÙØ´ ÙØªØ§Ø­ ÙÙÙØ§): {withoutAreas.map((group) => group.governorate).join('Ø ')} â Ø¶ÙÙ
          ÙÙØ§Ø·ÙÙØ§ ÙÙ{' '}
          <Link href="/shipping" className="font-semibold text-accent">
            ØµÙØ­Ø© Ø§ÙØ´Ø­Ù
          </Link>
          .
        </p>
      ) : null}

      {localError ? <p className="text-sm font-semibold text-danger">{localError}</p> : null}
      <FailureBanner failure={failure} onRetry={retry} onDiscardAndRefresh={() => router.refresh()} />
      <SaveBar state={state} onSave={save} warning={warning} />
    </div>
  )
}
