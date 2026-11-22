import 'server-only'

import {
  DEFAULT_INSPECTION_NOTE,
  INSTALLATION_LIMITS,
  installationGovernorates,
  isInstallationMoney,
  isInstallationMode,
  parseInstallerOnlyIds,
  INSTALLER_ONLY_MAX_PRODUCTS,
  type InstallationMode,
  type InstallationAreas,
  type InstallationConfig,
} from '@zell/core'
import { restInsert } from '../data/client'
import type { MutationResult } from '../mutations'
import { timestamp } from '../validation/shared'
import { CONFLICT_MESSAGE, patchGuarded } from './concurrency'
import { toInternalFailure } from './errors'
import { readShippingAreaGroups, readInstallationRecord, KEY } from '../data/installation'
import type { ShippingAreaGroup, InstallationRecord } from '../data/installation'

/**
 * ÙÙÙ Ø§ÙØªØ±ÙÙØ¨ â settings.installation (0018).
 *
 *   enabled              ØªØ´ØºÙÙ Ø§ÙØ®Ø¯ÙØ©
 *   note                 Ø³Ø·Ø± ØªÙØ¶ÙØ­ ØªØ­Øª Ø®ÙØ§Ø± Ø§ÙÙÙÙ ÙÙ ØµÙØ­Ø© Ø§ÙØ·ÙØ¨
 *   feePerMeterPiastres  Ø£Ø¬Ø± Ø§ÙØªØ±ÙÙØ¨ ÙÙÙ ÙØªØ± Ø·ÙÙÙ ÙÙ Ø£ÙÙØ§Ù Ø§ÙÙÙØ§Ø³ (1..1,000,000 ÙØ±Ø´)
 *   areas                { ÙØ­Ø§ÙØ¸Ø©: { ÙÙØ·ÙØ©: Ø§ÙØªÙØ§Ù Ø§ÙÙÙÙ Ø¨Ø§ÙÙØ±Ø´ (0..1,000,000) } }
 *   governorates         ÙØ´ØªÙ ÙÙ areas â ÙÙÙØ³Ø®Ø© Ø§ÙØ­Ø§ÙÙØ© ÙÙ Ø§ÙÙØªØ¬Ø± Ø¨Ø³
 *
 * â ï¸ Ø£Ø³ÙØ§Ø¡ Ø§ÙÙØ­Ø§ÙØ¸Ø§Øª ÙØ§ÙÙÙØ§Ø·Ù ÙÙ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§ÙØ´Ø­Ù Ø¨Ø³ (shipping_rates + shipping_areas).
 *    Ø§ÙØ³ÙØ±ÙØ± Ø¨ÙØ±ÙØ¶ Ø£Ù ÙÙØ·ÙØ© ÙØ´ ÙÙØ¬ÙØ¯Ø© ÙÙØ§Ù â ÙÙÙØ´ ÙØªØ§Ø¨Ø© Ø£Ø³ÙØ§Ø¡ Ø¨Ø¥ÙØ¯.
 * â ï¸ ØªØ²Ø§ÙÙ ØªÙØ§Ø¤ÙÙ Ø¨Ù settings.updated_at (patchGuarded) + ÙØ±Ø§Ø¡Ø© ØªØ£ÙÙØ¯.
 *    Ø§ÙØ­Ø³Ø§Ø¨ ÙÙØ³Ù ÙÙ zell_create_order â ÙÙØ§ Ø¥Ø¹Ø¯Ø§Ø¯ Ø¨Ø³.
 */

export type InstallationInput = {
  enabled: boolean
  note: string
  inspectionNote: string
  feePerMeterPiastres: number | null
  areas: InstallationAreas
  /** INSTALLER-ONLY â Ø·Ø±ÙÙØ© Ø§ÙØªØ±ÙÙØ¨ (Ø§ÙØºØ§ÙØ¨ = 'choice'). */
  mode?: InstallationMode
  /** INSTALLER-ONLY â Ø£ÙÙØ§Ù Â«ÙÙÙ ÙÙØ·Â» ÙÙØ§ mode = 'installer_products'. */
  installerOnlyProductIds?: number[]

  whatsappMessage?: string}

/** ÙÙØ·ÙØ© ÙØªØ­ÙØ¸Ø© ÙÙÙÙÙ ÙÙØ´ ÙÙØ¬ÙØ¯Ø© ÙÙ Ø§ÙØ´Ø­Ù (Ø§ØªØ´Ø§ÙØª Ø£Ù Ø§ØªØºÙØ± Ø§Ø³ÙÙØ§). */
export type OrphanArea = { governorate: string; area: string }

/** Ø§ÙÙÙØ§Ø·Ù Ø§ÙÙÙØ¹ÙÙØ© ÙÙÙÙÙ Ø§ÙÙÙ ÙØ´ ÙÙ ÙÙØ§Ø·Ù Ø§ÙØ´Ø­Ù. */
export function orphanAreas(areas: InstallationAreas, groups: ShippingAreaGroup[]): OrphanArea[] {
  const shipping = new Map(groups.map((group) => [group.governorate, group.areas]))
  const out: OrphanArea[] = []
  for (const [governorate, list] of Object.entries(areas)) {
    const known = shipping.get(governorate) ?? []
    for (const area of Object.keys(list)) if (!known.includes(area)) out.push({ governorate, area })
  }
  return out
}

/** Ø¨Ø¹Ø¯ Ø­ÙØ¸ Ø§ÙØ´Ø­Ù: ÙÙØ§Ø·Ù Ø§ÙÙÙÙ Ø§ÙÙÙ ÙØ§Ø¨ÙØªØ´ ÙÙØ¬ÙØ¯Ø© ÙÙ Ø§ÙØ´Ø­Ù. */
export async function installerAreasMissingFromShipping(): Promise<OrphanArea[]> {
  const [record, groups] = await Promise.all([readInstallationRecord(), readShippingAreaGroups()])
  return orphanAreas(record.config.areas, groups)
}

function sameConfig(a: InstallationConfig, b: InstallationConfig): boolean {
  if (a.enabled !== b.enabled || a.note !== b.note || a.inspectionNote !== b.inspectionNote || a.feePerMeterPiastres !== b.feePerMeterPiastres) return false
  if ((a.mode ?? 'choice') !== (b.mode ?? 'choice')) return false
  if ((a.installerOnlyProductIds ?? []).join(',') !== (b.installerOnlyProductIds ?? []).join(',')) return false
  const flat = (areas: InstallationAreas): string =>
    Object.entries(areas)
      .flatMap(([governorate, list]) => Object.entries(list).map(([area, travel]) => governorate + '|' + area + '|' + String(travel)))
      .sort()
      .join('\n')
  return flat(a.areas) === flat(b.areas)
}

const MAX_POUNDS = String(INSTALLATION_LIMITS.maxPiastres / 100)

/** rawExpected: updated_at Ø§ÙÙÙ Ø§ÙÙÙØ­Ø© Ø´Ø§ÙØªÙØ Ø£Ù null ÙÙ Ø§ÙØµÙ ÙÙØ§ÙØ´ ÙÙØ¬ÙØ¯. */
export async function saveInstallation(raw: unknown, rawExpected: unknown): Promise<MutationResult<InstallationRecord>> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, code: 'VALIDATION', message: 'Ø§ÙØ¨ÙØ§ÙØ§Øª ÙØ´ ØµØ­ÙØ­Ø©' }
  }
  const input = raw as Record<string, unknown>
  const enabled = input['enabled']
  if (typeof enabled !== 'boolean') return { ok: false, code: 'VALIDATION', message: 'ÙÙØªØ§Ø­ Ø§ÙØªØ´ØºÙÙ ÙØ´ ØµØ­ÙØ­' }
  const note = typeof input['note'] === 'string' ? input['note'].trim() : ''
  if (note.length > INSTALLATION_LIMITS.note) {
    return { ok: false, code: 'VALIDATION', message: 'Ø³Ø·Ø± Ø§ÙØªÙØ¶ÙØ­ Ø£Ø·ÙÙ ÙÙ ' + String(INSTALLATION_LIMITS.note) + ' Ø­Ø±Ù' }
  }
  const inspectionNote = typeof input['inspectionNote'] === 'string' ? input['inspectionNote'].trim() : ''
  const normalizedInspectionNote = inspectionNote === '' ? DEFAULT_INSPECTION_NOTE : inspectionNote
  if (inspectionNote.length > INSTALLATION_LIMITS.inspectionNote) {
    return { ok: false, code: 'VALIDATION', message: 'Ø±Ø³Ø§ÙØ© Ø§ÙÙØ¹Ø§ÙÙØ© Ø£Ø·ÙÙ ÙÙ ' + String(INSTALLATION_LIMITS.inspectionNote) + ' Ø­Ø±Ù' }
  const whatsappMessage = typeof input['whatsappMessage'] === 'string' ? input['whatsappMessage'].trim() : ''
  const normalizedWhatsappMessage = whatsappMessage === '' ? DEFAULT_WHATSAPP_MESSAGE : whatsappMessage
  if (whatsappMessage.length > INSTALLATION_LIMITS.whatsappMessage) {
    return { ok: false, code: 'VALIDATION', message: 'قالب واتساب أطول من ' + String(INSTALLATION_LIMITS.whatsappMessage) + ' حرف' }
  }
  }

  // INSTALLER-ONLY â Ø§ÙØºØ§ÙØ¨ = 'choice' (ÙØ³Ø®Ø© ÙÙØ­Ø© ÙØ¯ÙÙØ©)
  const modeRaw = input['mode'] === undefined ? 'choice' : input['mode']
  if (!isInstallationMode(modeRaw)) return { ok: false, code: 'VALIDATION', message: 'Ø·Ø±ÙÙØ© Ø§ÙØªØ±ÙÙØ¨ ØºÙØ± ØµØ­ÙØ­Ø©.' }
  const mode: InstallationMode = modeRaw
  const idsRaw = input['installerOnlyProductIds'] === undefined ? [] : input['installerOnlyProductIds']
  if (
    !Array.isArray(idsRaw) ||
    idsRaw.length > INSTALLER_ONLY_MAX_PRODUCTS ||
    idsRaw.some((id) => typeof id !== 'number' || !Number.isInteger(id) || id <= 0)
  ) {
    return { ok: false, code: 'VALIDATION', message: 'ÙØ§Ø¦ÙØ© ÙÙØªØ¬Ø§Øª Â«ÙÙÙ ÙÙØ·Â» ØºÙØ± ØµØ­ÙØ­Ø©.' }
  }
  const installerOnlyProductIds = parseInstallerOnlyIds(idsRaw)
  if (mode === 'installer_products' && installerOnlyProductIds.length === 0) {
    return { ok: false, code: 'VALIDATION', message: 'ÙÙØ±Ø¬Ù Ø§Ø®ØªÙØ§Ø± ÙÙØªØ¬ ÙØ§Ø­Ø¯ Ø¹ÙÙ Ø§ÙØ£ÙÙ ÙØ®ÙØ§Ø± Â«ÙÙÙ ÙÙØ· â ÙÙØªØ¬Ø§Øª ÙØ­Ø¯Ø¯Ø©Â».' }
  }

  let fee: number | null = null
  const feeRaw = input['feePerMeterPiastres']
  if (feeRaw !== null && feeRaw !== undefined) {
    if (!isInstallationMoney(feeRaw, 1)) {
      return { ok: false, code: 'VALIDATION', message: 'Ø³Ø¹Ø± ØªØ±ÙÙØ¨ Ø§ÙÙØªØ± ÙØ§Ø²Ù ÙÙÙÙ ÙÙ 0.01 ÙÙ ' + MAX_POUNDS + ' Ø¬ÙÙÙ' }
    }
    fee = feeRaw
  }

  const areasRaw = input['areas']
  if (typeof areasRaw !== 'object' || areasRaw === null || Array.isArray(areasRaw)) {
    return { ok: false, code: 'VALIDATION', message: 'Ø§ÙÙÙØ§Ø·Ù ÙØ´ ØµØ­ÙØ­Ø©' }
  }

  try {
    const groups = await readShippingAreaGroups()
    const shipping = new Map(groups.map((group) => [group.governorate, group.areas]))
    const areas: InstallationAreas = {}
    let count = 0
    for (const [governorate, list] of Object.entries(areasRaw as Record<string, unknown>)) {
      const known = shipping.get(governorate)
      if (known === undefined) {
        return { ok: false, code: 'VALIDATION', message: 'ÙØ­Ø§ÙØ¸Ø© Â«' + governorate + 'Â» ÙØ´ ÙÙØ¬ÙØ¯Ø© ÙÙ Ø§ÙØ´Ø­Ù â Ø§Ø¹ÙÙ ØªØ­Ø¯ÙØ« ÙÙØµÙØ­Ø©.' }
      }
      if (typeof list !== 'object' || list === null || Array.isArray(list)) {
        return { ok: false, code: 'VALIDATION', message: 'ÙÙØ§Ø·Ù ' + governorate + ' ÙØ´ ØµØ­ÙØ­Ø©' }
      }
      const out: Record<string, number> = {}
      for (const [area, travel] of Object.entries(list as Record<string, unknown>)) {
        if (!known.includes(area)) {
          return {
            ok: false,
            code: 'VALIDATION',
            message: 'ÙÙØ·ÙØ© Â«' + area + 'Â» ÙØ´ ÙÙØ¬ÙØ¯Ø© ÙÙ ÙÙØ§Ø·Ù Ø§ÙØ´Ø­Ù ÙÙ' + governorate + ' â Ø§Ø¹ÙÙ ØªØ­Ø¯ÙØ« ÙÙØµÙØ­Ø©.',
          }
        }
        if (!isInstallationMoney(travel, 0)) {
          return { ok: false, code: 'VALIDATION', message: 'Ø§ÙØªÙØ§Ù Ø§ÙÙÙÙ ÙÙÂ«' + area + 'Â» ÙØ§Ø²Ù ÙÙÙÙ ÙÙ 0 ÙÙ ' + MAX_POUNDS + ' Ø¬ÙÙÙ' }
        }
        out[area] = travel
        count += 1
      }
      if (Object.keys(out).length > 0) areas[governorate] = out
    }
    if (fee === null && (enabled || count > 0)) {
      return { ok: false, code: 'VALIDATION', message: 'Ø§ÙØªØ¨ Ø³Ø¹Ø± ØªØ±ÙÙØ¨ Ø§ÙÙØªØ±' }
    }

    const value: Record<string, unknown> = {
      enabled,
      note,
      inspectionNote: normalizedInspectionNote,
      areas,
      governorates: installationGovernorates(areas),
      mode,
      installerOnlyProductIds,
    }
    if (fee !== null) value['feePerMeterPiastres'] = fee

    if (rawExpected === null) {
      try {
        await restInsert('settings', { key: KEY, value })
      } catch (error) {
        // Ø­Ø¯ ØªØ§ÙÙ Ø¹ÙÙ Ø§ÙØµÙ ÙÙ ÙÙØ³ Ø§ÙÙØ­Ø¸Ø© â ØªØ¹Ø§Ø±Ø¶ Ø­ÙÙÙÙØ ÙØ´ ÙØªØ§Ø¨Ø© ÙÙÙÙ
        const now = await readInstallationRecord()
        if (now.updatedAt !== null) return { ok: false, code: 'CONFLICT', message: CONFLICT_MESSAGE }
        return toInternalFailure(error)
      }
    } else {
      const stamp = timestamp(rawExpected, 'Ø·Ø§Ø¨Ø¹ Ø¢Ø®Ø± ØªØ¹Ø¯ÙÙ')
      if (!stamp.ok) return stamp
      const result = await patchGuarded<{ key: string }>({
        table: 'settings',
        idColumn: 'key',
        idValue: KEY,
        expectedUpdatedAt: stamp.value,
        changes: { value },
        select: 'key',
      })
      if (!result.ok) return result
    }

    const stored = await readInstallationRecord()
    const expected: InstallationConfig = { enabled, note, inspectionNote: normalizedInspectionNote, feePerMeterPiastres: fee, areas, mode, installerOnlyProductIds }
    if (stored.updatedAt === null || !sameConfig(stored.config, expected)) return toInternalFailure(null)
    return { ok: true, data: stored }
  } catch (error) {
    return toInternalFailure(error)
  }
}
