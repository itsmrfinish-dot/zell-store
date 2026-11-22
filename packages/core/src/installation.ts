/**
 * settings.installation Ã¢ÂÂ ÃÂÃÂÃÂ ÃÂ§ÃÂÃÂªÃÂ±ÃÂÃÂÃÂ¨ (0018).
 *
 *   { enabled, note, feePerMeterPiastres, areas: { ÃÂÃÂ­ÃÂ§ÃÂÃÂ¸ÃÂ©: { ÃÂÃÂÃÂ·ÃÂÃÂ©: ÃÂ§ÃÂÃÂªÃÂÃÂ§ÃÂ ÃÂ¨ÃÂ§ÃÂÃÂÃÂ±ÃÂ´ } }, governorates }
 *
 * Ã¢ÂÂ Ã¯Â¸Â ÃÂ§ÃÂÃÂ­ÃÂÃÂÃÂÃÂ ÃÂÃÂ zell_create_order: ÃÂ³ÃÂ¹ÃÂ± ÃÂ§ÃÂÃÂÃÂªÃÂ± ÃÂ¹ÃÂ¯ÃÂ¯ ÃÂµÃÂ­ÃÂÃÂ­ 1..1,000,000 ÃÂÃÂ±ÃÂ´ÃÂ ÃÂÃÂ§ÃÂÃÂ§ÃÂÃÂªÃÂÃÂ§ÃÂ 0..1,000,000.
 *    ÃÂ£ÃÂ ÃÂÃÂÃÂÃÂ© ÃÂ¨ÃÂ±ÃÂ ÃÂ§ÃÂÃÂ­ÃÂ¯ÃÂÃÂ¯ ÃÂ¯ÃÂ ÃÂ§ÃÂÃÂ¯ÃÂ§ÃÂªÃÂ§ÃÂ¨ÃÂÃÂ² ÃÂ¨ÃÂªÃÂ±ÃÂÃÂ¶ÃÂÃÂ§ÃÂ ÃÂÃÂ§ÃÂÃÂÃÂ±ÃÂ§ÃÂ¡ÃÂ© ÃÂÃÂÃÂ§ ÃÂ¨ÃÂªÃÂ³ÃÂÃÂ·ÃÂÃÂ§ ÃÂ¨ÃÂÃÂÃÂ³ ÃÂ§ÃÂÃÂ­ÃÂ¯ÃÂÃÂ¯.
 * Ã¢ÂÂ Ã¯Â¸Â governorates ÃÂÃÂ´ÃÂªÃÂ ÃÂÃÂ areas (ÃÂ§ÃÂÃÂÃÂ­ÃÂ§ÃÂÃÂ¸ÃÂ§ÃÂª ÃÂ§ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂ§ ÃÂÃÂÃÂ·ÃÂÃÂ© ÃÂÃÂÃÂ¹ÃÂÃÂÃÂ©) ÃÂ¹ÃÂ´ÃÂ§ÃÂ ÃÂÃÂ³ÃÂ®ÃÂ© ÃÂ§ÃÂÃÂÃÂªÃÂ¬ÃÂ± ÃÂ§ÃÂÃÂÃÂ
 *    ÃÂÃÂ³ÃÂ ÃÂ¨ÃÂªÃÂÃÂ±ÃÂ§ÃÂ ÃÂªÃÂÃÂ¶ÃÂ ÃÂ´ÃÂºÃÂ§ÃÂÃÂ©. ÃÂÃÂ§ÃÂ¨ÃÂÃÂªÃÂÃÂªÃÂ¨ÃÂ´ ÃÂ¨ÃÂ¥ÃÂÃÂ¯.
 */

export const INSTALLATION_LIMITS = { note: 300, inspectionNote: 600, whatsappMessage: 600, area: 40, maxPiastres: 1_000_000 } as const

export const DEFAULT_INSPECTION_NOTE = 'ÃÂ§ÃÂÃÂªÃÂ±ÃÂÃÂÃÂ¨ ÃÂ¨ÃÂÃÂ¨ÃÂ¯ÃÂ£ ÃÂ¨ÃÂÃÂ¹ÃÂ§ÃÂÃÂÃÂ©: ÃÂ§ÃÂÃÂÃÂÃÂ ÃÂ¨ÃÂÃÂÃÂ¬ÃÂ ÃÂÃÂÃÂÃÂ³ ÃÂ§ÃÂÃÂ¥ÃÂ²ÃÂ§ÃÂ² ÃÂ¹ÃÂÃÂ ÃÂ§ÃÂÃÂ·ÃÂ¨ÃÂÃÂ¹ÃÂ©ÃÂ ÃÂÃÂªÃÂÃÂÃÂÃÂ© ÃÂ§ÃÂÃÂªÃÂ±ÃÂÃÂÃÂ¨ ÃÂ¨ÃÂªÃÂªÃÂ­ÃÂ³ÃÂ¨ ÃÂ¨ÃÂ§ÃÂÃÂÃÂªÃÂ± ÃÂ§ÃÂÃÂÃÂ±ÃÂ¨ÃÂ¹ ÃÂ­ÃÂ³ÃÂ¨ ÃÂ§ÃÂÃÂÃÂÃÂ§ÃÂ³ ÃÂ§ÃÂÃÂÃÂ¹ÃÂÃÂÃÂ ÃÂÃÂ¨ÃÂªÃÂ¹ÃÂ±ÃÂ ÃÂ§ÃÂÃÂªÃÂÃÂÃÂÃÂ© ÃÂ§ÃÂÃÂÃÂÃÂ§ÃÂ¦ÃÂÃÂ© ÃÂÃÂªÃÂÃÂ§ÃÂÃÂ ÃÂ¹ÃÂÃÂÃÂÃÂ§ ÃÂÃÂ¨ÃÂ ÃÂÃÂ§ ÃÂÃÂ¨ÃÂ¯ÃÂ£ ÃÂ§ÃÂÃÂ´ÃÂºÃÂ. ÃÂ³ÃÂ¹ÃÂ± ÃÂ§ÃÂÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ³ÃÂ ÃÂ¨ÃÂ§ÃÂÃÂÃÂªÃÂ± ÃÂ§ÃÂÃÂ·ÃÂÃÂÃÂ ÃÂ²ÃÂ ÃÂÃÂ§ ÃÂÃÂ ÃÂÃÂÃÂªÃÂÃÂ¨ ÃÂÃÂ ÃÂ§ÃÂÃÂµÃÂÃÂ­ÃÂ©.' as const

export const DEFAULT_WHATSAPP_MESSAGE = 'مرحبًا، محتاج معاينة قبل التركيب للمنتج {product}. {measurements} عارف إن تكلفة التركيب بتتحسب بالمتر المربع بعد القياس الفعلي، وعايز أعرف التكلفة النهائية ونتفق عليها قبل ما يبدأ الشغل. سعر الفيلم نفسه بالمتر الطولي حسب الصفحة. {link}' as const

/**
 * INSTALLER-ONLY (ÃÂÃÂ±ÃÂ§ÃÂ± ÃÂ§ÃÂÃÂÃÂ§ÃÂÃÂ 2026-11-05) Ã¢ÂÂ ÃÂ·ÃÂ±ÃÂÃÂÃÂ© ÃÂ§ÃÂÃÂªÃÂ±ÃÂÃÂÃÂ¨ ÃÂÃÂ ÃÂµÃÂÃÂ­ÃÂ© ÃÂ«ÃÂÃÂÃÂ ÃÂ§ÃÂÃÂªÃÂ±ÃÂÃÂÃÂ¨ÃÂ» ÃÂÃÂ ÃÂ§ÃÂÃÂÃÂÃÂ­ÃÂ©:
 *   choice              ÃÂ§ÃÂÃÂ¹ÃÂÃÂÃÂ ÃÂÃÂ®ÃÂªÃÂ§ÃÂ± (ÃÂ²ÃÂ ÃÂÃÂ§ ÃÂÃÂ Ã¢ÂÂ ÃÂ§ÃÂÃÂ§ÃÂÃÂªÃÂ±ÃÂ§ÃÂ¶ÃÂÃÂ ÃÂÃÂ§ÃÂÃÂ¥ÃÂ¹ÃÂ¯ÃÂ§ÃÂ¯ ÃÂ§ÃÂÃÂÃÂ¯ÃÂÃÂ ÃÂÃÂ ÃÂºÃÂÃÂ± mode)
 *   installer_all       ÃÂÃÂÃÂ ÃÂÃÂÃÂ· ÃÂÃÂÃÂ ÃÂ£ÃÂÃÂÃÂ§ÃÂ ÃÂ§ÃÂÃÂÃÂÃÂ§ÃÂ³
 *   installer_products  ÃÂÃÂÃÂ ÃÂÃÂÃÂ· ÃÂÃÂÃÂÃÂÃÂªÃÂ¬ÃÂ§ÃÂª ÃÂÃÂ installerOnlyProductIds
 */
export const INSTALLATION_MODES = ['choice', 'installer_all', 'installer_products'] as const
export type InstallationMode = (typeof INSTALLATION_MODES)[number]
export const INSTALLER_ONLY_MAX_PRODUCTS = 500

export function isInstallationMode(value: unknown): value is InstallationMode {
  return typeof value === 'string' && (INSTALLATION_MODES as readonly string[]).includes(value)
}

/** ÃÂÃÂ¹ÃÂ±ÃÂÃÂÃÂ§ÃÂª ÃÂÃÂÃÂªÃÂ¬ÃÂ§ÃÂª: ÃÂ£ÃÂ±ÃÂÃÂ§ÃÂ ÃÂµÃÂ­ÃÂÃÂ­ÃÂ© ÃÂÃÂÃÂ¬ÃÂ¨ÃÂ© ÃÂÃÂ ÃÂºÃÂÃÂ± ÃÂªÃÂÃÂ±ÃÂ§ÃÂ±ÃÂ ÃÂ¨ÃÂ§ÃÂÃÂªÃÂ±ÃÂªÃÂÃÂ¨ÃÂ ÃÂÃÂ­ÃÂ¯ ÃÂ§ÃÂÃÂ£ÃÂÃÂµÃÂ. ÃÂ£ÃÂ ÃÂÃÂÃÂÃÂ© ÃÂºÃÂÃÂ· ÃÂ¨ÃÂªÃÂªÃÂ´ÃÂ§ÃÂ. */
export function parseInstallerOnlyIds(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  const out: number[] = []
  for (const item of value) {
    if (typeof item !== 'number' || !Number.isInteger(item) || item <= 0 || out.includes(item)) continue
    out.push(item)
    if (out.length >= INSTALLER_ONLY_MAX_PRODUCTS) break
  }
  return out
}

/** { ÃÂÃÂ­ÃÂ§ÃÂÃÂ¸ÃÂ©: { ÃÂÃÂÃÂ·ÃÂÃÂ©: ÃÂ§ÃÂÃÂªÃÂÃÂ§ÃÂ ÃÂ§ÃÂÃÂÃÂÃÂ ÃÂ¨ÃÂ§ÃÂÃÂÃÂ±ÃÂ´ } } Ã¢ÂÂ ÃÂ§ÃÂÃÂÃÂÃÂ·ÃÂÃÂ© ÃÂ§ÃÂÃÂÃÂÃÂ¬ÃÂÃÂ¯ÃÂ© ÃÂÃÂÃÂ§ = ÃÂÃÂªÃÂ§ÃÂ­ÃÂ© ÃÂÃÂÃÂÃÂÃÂ. */
export type InstallationAreas = Record<string, Record<string, number>>

export type InstallationConfig = {
  enabled: boolean
  note: string
  /** null = ÃÂÃÂ³ÃÂ ÃÂÃÂªÃÂ­ÃÂ¯ÃÂ¯ÃÂ´ÃÂ ÃÂÃÂ§ÃÂÃÂÃÂÃÂ ÃÂÃÂ´ ÃÂÃÂªÃÂ§ÃÂ­ ÃÂÃÂ­ÃÂ¯ ÃÂÃÂ§ ÃÂÃÂªÃÂÃÂªÃÂ¨. */
  feePerMeterPiastres: number | null
  areas: InstallationAreas
  /** INSTALLER-ONLY Ã¢ÂÂ ÃÂÃÂ§ÃÂÃÂµ = 'choice' (ÃÂ§ÃÂÃÂ¹ÃÂÃÂÃÂ ÃÂÃÂ®ÃÂªÃÂ§ÃÂ±). */
  mode?: InstallationMode
  /** INSTALLER-ONLY Ã¢ÂÂ ÃÂ£ÃÂÃÂÃÂ§ÃÂ ÃÂ«ÃÂÃÂÃÂ ÃÂÃÂÃÂ·ÃÂ» ÃÂÃÂÃÂ§ mode = 'installer_products'. */
  installerOnlyProductIds?: number[]
  /** ÃÂ±ÃÂ³ÃÂ§ÃÂÃÂ© ÃÂ§ÃÂÃÂÃÂ¹ÃÂ§ÃÂÃÂÃÂ© (ÃÂ¨ÃÂªÃÂ¸ÃÂÃÂ± ÃÂÃÂÃÂ¹ÃÂÃÂÃÂ ÃÂ¹ÃÂÃÂ¯ ÃÂ§ÃÂ®ÃÂªÃÂÃÂ§ÃÂ± ÃÂ§ÃÂÃÂÃÂ¹ÃÂ§ÃÂÃÂÃÂ©). */
  inspectionNote?: string
}

/** ÃÂ±ÃÂÃÂ ÃÂµÃÂ­ÃÂÃÂ­ ÃÂ¨ÃÂ§ÃÂÃÂÃÂ±ÃÂ´ ÃÂÃÂ min ÃÂÃÂ­ÃÂ¯ ÃÂ§ÃÂÃÂ£ÃÂÃÂµÃÂ Ã¢ÂÂ ÃÂÃÂÃÂ³ ÃÂ­ÃÂ¯ÃÂÃÂ¯ zell_create_order. */
export function isInstallationMoney(value: unknown, min: 0 | 1): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= INSTALLATION_LIMITS.maxPiastres
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

export function parseInstallationConfig(value: unknown): InstallationConfig {
  const raw = asRecord(value) ?? {}
  const areas: InstallationAreas = {}
  const rawAreas = asRecord(raw['areas'])
  if (rawAreas) {
    for (const [governorate, list] of Object.entries(rawAreas)) {
      const entries = asRecord(list)
      if (!entries) continue
      const out: Record<string, number> = {}
      for (const [area, travel] of Object.entries(entries)) {
        const name = area.trim()
        if (name === '' || !isInstallationMoney(travel, 0)) continue
        out[name] = travel
      }
      if (Object.keys(out).length > 0) areas[governorate] = out
    }
  }
  const fee = raw['feePerMeterPiastres']
  const mode = raw['mode']
  const inspectionNote = typeof raw['inspectionNote'] === 'string' 
    ? raw['inspectionNote'].trim().substring(0, INSTALLATION_LIMITS.inspectionNote)
    : DEFAULT_INSPECTION_NOTE
  
  return {
    enabled: raw['enabled'] === true,
    note: typeof raw['note'] === 'string' ? raw['note'] : '',
    inspectionNote: inspectionNote || DEFAULT_INSPECTION_NOTE,
    feePerMeterPiastres: isInstallationMoney(fee, 1) ? fee : null,
    areas,
    mode: isInstallationMode(mode) ? mode : 'choice',
    installerOnlyProductIds: parseInstallerOnlyIds(raw['installerOnlyProductIds']),
  }
}

/** ÃÂ§ÃÂÃÂÃÂ­ÃÂ§ÃÂÃÂ¸ÃÂ§ÃÂª ÃÂ§ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂ§ ÃÂÃÂÃÂ·ÃÂÃÂ© ÃÂÃÂÃÂ¹ÃÂÃÂÃÂ© ÃÂÃÂ§ÃÂ­ÃÂ¯ÃÂ© ÃÂ¹ÃÂÃÂ ÃÂ§ÃÂÃÂ£ÃÂÃÂÃÂ ÃÂ¨ÃÂªÃÂ±ÃÂªÃÂÃÂ¨ areas. */
export function installationGovernorates(areas: InstallationAreas): string[] {
  return Object.keys(areas).filter((governorate) => Object.keys(areas[governorate] ?? {}).length > 0)
}

/**
 * ÃÂ·ÃÂÃÂ ÃÂ§ÃÂÃÂªÃÂ±ÃÂÃÂÃÂ¨ = ÃÂÃÂ¬ÃÂÃÂÃÂ¹ ÃÂ£ÃÂ·ÃÂÃÂ§ÃÂ ÃÂ³ÃÂ·ÃÂÃÂ± ÃÂ§ÃÂÃÂÃÂÃÂ§ÃÂ³ ÃÂ¨ÃÂ§ÃÂÃÂ³ÃÂÃÂªÃÂÃÂÃÂªÃÂ±. ÃÂ§ÃÂÃÂÃÂÃÂªÃÂ¬ÃÂ§ÃÂª ÃÂ¨ÃÂ§ÃÂÃÂ¹ÃÂ¯ÃÂ¯ ÃÂÃÂ´ ÃÂ¯ÃÂ§ÃÂ®ÃÂÃÂ© Ã¢ÂÂ
 * ÃÂÃÂÃÂ³ zell_create_order (sum(length_cm) filter (where sale_unit = 'meter')).
 */
export function installationLengthCm(
  entries: ReadonlyArray<{ product: { sale_unit?: string }; line: { lengthCm: number } }>,
): number {
  let total = 0
  for (const entry of entries) {
    if (entry.product.sale_unit === 'piece') continue
    if (Number.isInteger(entry.line.lengthCm) && entry.line.lengthCm > 0) total += entry.line.lengthCm
  }
  return total
}

/**
 * ÃÂ£ÃÂ¬ÃÂ± ÃÂ§ÃÂÃÂªÃÂ±ÃÂÃÂÃÂ¨ ÃÂ¨ÃÂ§ÃÂÃÂÃÂ±ÃÂ´ = round(ÃÂ³ÃÂ¹ÃÂ± ÃÂ§ÃÂÃÂÃÂªÃÂ± ÃÂ ÃÂ§ÃÂÃÂ·ÃÂÃÂ ÃÂ· ÃÂ¡ÃÂ ÃÂ ) ÃÂ¨ÃÂ£ÃÂ±ÃÂÃÂ§ÃÂ ÃÂµÃÂ­ÃÂÃÂ­ÃÂ© ÃÂÃÂ ÃÂºÃÂÃÂ± float.
 * ÃÂ§ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ¬ÃÂ¨ÃÂ©ÃÂ ÃÂÃÂ§ÃÂÃÂÃÂµ ÃÂ¨ÃÂÃÂªÃÂÃÂ±ÃÂ¨ ÃÂÃÂÃÂÃÂ Ã¢ÂÂ ÃÂÃÂÃÂ³ round(numeric) ÃÂÃÂ zell_create_order ÃÂ¨ÃÂ§ÃÂÃÂ­ÃÂ±ÃÂ.
 * ÃÂÃÂÃÂ¹ÃÂ±ÃÂ¶ ÃÂ¨ÃÂ³ÃÂ ÃÂ§ÃÂÃÂ±ÃÂÃÂ ÃÂ§ÃÂÃÂÃÂ¹ÃÂªÃÂÃÂ¯ ÃÂÃÂ ÃÂ§ÃÂÃÂ¯ÃÂ§ÃÂªÃÂ§ÃÂ¨ÃÂÃÂ².
 */
export function installationFeePiastres(feePerMeterPiastres: number, lengthCm: number): number {
  if (!Number.isInteger(feePerMeterPiastres) || !Number.isInteger(lengthCm)) return 0
  if (feePerMeterPiastres <= 0 || lengthCm <= 0) return 0
  const product = feePerMeterPiastres * lengthCm
  const rest = product % 100
  return (product - rest) / 100 + (rest >= 50 ? 1 : 0)
}

/** ÃÂ§ÃÂÃÂÃÂÃÂ§ÃÂ·ÃÂ ÃÂ§ÃÂÃÂÃÂªÃÂ§ÃÂ­ÃÂ© ÃÂÃÂÃÂÃÂÃÂ ÃÂÃÂ ÃÂÃÂ­ÃÂ§ÃÂÃÂ¸ÃÂ© Ã¢ÂÂ ÃÂÃÂ§ÃÂ¶ÃÂÃÂ© ÃÂÃÂ ÃÂ§ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂ ÃÂ£ÃÂ ÃÂ³ÃÂ¹ÃÂ± ÃÂ§ÃÂÃÂÃÂªÃÂ± ÃÂÃÂ§ÃÂÃÂµ. */
export function installationAreasIn(config: InstallationConfig, governorate: string): string[] {
  if (!config.enabled || config.feePerMeterPiastres === null) return []
  return Object.keys(config.areas[governorate] ?? {})
}

/** ÃÂ§ÃÂÃÂªÃÂÃÂ§ÃÂ ÃÂ§ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂ·ÃÂÃÂ© ÃÂ¨ÃÂ§ÃÂÃÂÃÂ±ÃÂ´ Ã¢ÂÂ null = ÃÂ§ÃÂÃÂÃÂÃÂ ÃÂÃÂ´ ÃÂÃÂªÃÂ§ÃÂ­ ÃÂÃÂÃÂ§ÃÂ. */
export function installationTravelPiastres(config: InstallationConfig, governorate: string, area: string): number | null {
  if (!config.enabled || config.feePerMeterPiastres === null) return null
  const travel = config.areas[governorate]?.[area]
  return travel === undefined ? null : travel
}

/** ÃÂ§ÃÂÃÂÃÂ­ÃÂ§ÃÂÃÂ¸ÃÂ§ÃÂª ÃÂ§ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂ§ ÃÂÃÂÃÂ·ÃÂÃÂ© ÃÂÃÂªÃÂ§ÃÂ­ÃÂ© ÃÂÃÂÃÂÃÂÃÂ Ã¢ÂÂ ÃÂÃÂ§ÃÂ¶ÃÂÃÂ© ÃÂÃÂ ÃÂ§ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂ ÃÂ£ÃÂ ÃÂ³ÃÂ¹ÃÂ± ÃÂ§ÃÂÃÂÃÂªÃÂ± ÃÂÃÂ§ÃÂÃÂµ. */
export function installationReadyGovernorates(config: InstallationConfig): string[] {
  if (!config.enabled || config.feePerMeterPiastres === null) return []
  return installationGovernorates(config.areas)
}

/**
 * INSTALLER-ONLY (ÃÂÃÂ±ÃÂ§ÃÂ± ÃÂ§ÃÂÃÂÃÂ§ÃÂÃÂ 2026-11-05) Ã¢ÂÂ ÃÂ§ÃÂÃÂÃÂÃÂªÃÂ¬ ÃÂ¯ÃÂ ÃÂ«ÃÂÃÂÃÂ ÃÂÃÂÃÂ·ÃÂ»ÃÂ ÃÂ¹ÃÂ±ÃÂ¶ ÃÂ¨ÃÂ³: zell_create_order ÃÂÃÂ§ÃÂÃÂÃÂ§ÃÂ´ ÃÂ¯ÃÂ¹ÃÂÃÂ© ÃÂ¨ÃÂÃÂ.
 * ÃÂ¨ÃÂ³ ÃÂÃÂÃÂ§ ÃÂ§ÃÂÃÂÃÂÃÂ ÃÂÃÂªÃÂ§ÃÂ­ ÃÂÃÂ¹ÃÂÃÂÃÂ§ (installationReadyGovernorates ÃÂÃÂ´ ÃÂÃÂ§ÃÂ¶ÃÂÃÂ©) Ã¢ÂÂ ÃÂÃÂ ÃÂ§ÃÂÃÂ®ÃÂ¯ÃÂÃÂ© ÃÂÃÂÃÂÃÂÃÂÃÂ© ÃÂ£ÃÂ ÃÂÃÂ§ÃÂÃÂÃÂ§ÃÂ´ ÃÂ³ÃÂ¹ÃÂ± ÃÂ£ÃÂ ÃÂÃÂÃÂ§ÃÂ·ÃÂÃÂ
 * ÃÂÃÂ ÃÂ­ÃÂ§ÃÂ¬ÃÂ© ÃÂ´ÃÂºÃÂ§ÃÂÃÂ© ÃÂ²ÃÂ ÃÂÃÂ§ ÃÂÃÂ ÃÂÃÂ§ÃÂÃÂ¹ÃÂÃÂÃÂ ÃÂ¨ÃÂÃÂ®ÃÂªÃÂ§ÃÂ± ÃÂ¹ÃÂ§ÃÂ¯ÃÂ.
 */
export function installerRequiredFor(config: InstallationConfig, productId: number): boolean {
  if (installationReadyGovernorates(config).length === 0) return false
  if (config.mode === 'installer_all') return true
  if (config.mode === 'installer_products') return (config.installerOnlyProductIds ?? []).includes(productId)
  return false
}

/**
 * INSTALLER-ONLY Ã¢ÂÂ ÃÂ§ÃÂÃÂ·ÃÂÃÂ¨ ÃÂÃÂÃÂ ÃÂ«ÃÂÃÂÃÂ ÃÂÃÂÃÂ·ÃÂ» ÃÂÃÂ ÃÂÃÂÃÂ ÃÂÃÂÃÂªÃÂ¬ ÃÂ¨ÃÂ§ÃÂÃÂÃÂÃÂ§ÃÂ³ ÃÂÃÂ§ÃÂ­ÃÂ¯ ÃÂ«ÃÂÃÂÃÂ ÃÂÃÂÃÂ·ÃÂ» (ÃÂ§ÃÂÃÂ§ÃÂ®ÃÂªÃÂÃÂ§ÃÂ± ÃÂÃÂ§ÃÂ­ÃÂ¯ ÃÂÃÂÃÂ·ÃÂÃÂ¨ ÃÂÃÂÃÂ).
 * ÃÂÃÂÃÂªÃÂ¬ÃÂ§ÃÂª ÃÂ§ÃÂÃÂÃÂ·ÃÂ¹ÃÂ© (ÃÂ§ÃÂÃÂ£ÃÂ¯ÃÂÃÂ§ÃÂª) ÃÂÃÂ´ ÃÂ¯ÃÂ§ÃÂ®ÃÂÃÂ©.
 */
export function orderRequiresInstaller(
  config: InstallationConfig,
  products: ReadonlyArray<{ id: number; sale_unit?: string }>,
): boolean {
  return products.some((product) => product.sale_unit !== 'piece' && installerRequiredFor(config, product.id))
}
