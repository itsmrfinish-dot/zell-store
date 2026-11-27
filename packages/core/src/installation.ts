/**
 * settings.installation â ÙÙÙ Ø§ÙØªØ±ÙÙØ¨ (0018).
 *
 *   { enabled, note, feePerSquareMeterPiastres, areas: { ÙØ­Ø§ÙØ¸Ø©: { ÙÙØ·ÙØ©: Ø§ÙØªÙØ§Ù Ø¨Ø§ÙÙØ±Ø´ } }, governorates }
 *
 * â ï¸ Ø§ÙØ­ÙÙÙÙ ÙÙ zell_create_order: Ø³Ø¹Ø± Ø§ÙÙØªØ± Ø¹Ø¯Ø¯ ØµØ­ÙØ­ 1..1,000,000 ÙØ±Ø´Ø ÙØ§ÙØ§ÙØªÙØ§Ù 0..1,000,000.
 *    Ø£Ù ÙÙÙØ© Ø¨Ø±Ù Ø§ÙØ­Ø¯ÙØ¯ Ø¯Ù Ø§ÙØ¯Ø§ØªØ§Ø¨ÙØ² Ø¨ØªØ±ÙØ¶ÙØ§Ø ÙØ§ÙÙØ±Ø§Ø¡Ø© ÙÙØ§ Ø¨ØªØ³ÙØ·ÙØ§ Ø¨ÙÙØ³ Ø§ÙØ­Ø¯ÙØ¯.
 * â ï¸ governorates ÙØ´ØªÙ ÙÙ areas (Ø§ÙÙØ­Ø§ÙØ¸Ø§Øª Ø§ÙÙÙ ÙÙÙØ§ ÙÙØ·ÙØ© ÙÙØ¹ÙÙØ©) Ø¹Ø´Ø§Ù ÙØ³Ø®Ø© Ø§ÙÙØªØ¬Ø± Ø§ÙÙÙ
 *    ÙØ³Ù Ø¨ØªÙØ±Ø§Ù ØªÙØ¶Ù Ø´ØºØ§ÙØ©. ÙØ§Ø¨ÙØªÙØªØ¨Ø´ Ø¨Ø¥ÙØ¯.
 */

export const INSTALLATION_LIMITS = { note: 300, inspectionNote: 600, whatsappMessage: 600, area: 40, maxPiastres: 1_000_000 } as const

export const DEFAULT_INSPECTION_NOTE = 'Ø§ÙØªØ±ÙÙØ¨ Ø¨ÙØ¨Ø¯Ø£ Ø¨ÙØ¹Ø§ÙÙØ©: Ø§ÙÙÙÙ Ø¨ÙÙØ¬Ù ÙÙÙØ³ Ø§ÙØ¥Ø²Ø§Ø² Ø¹ÙÙ Ø§ÙØ·Ø¨ÙØ¹Ø©. Ø¨Ø¹Ø¯ Ø§ÙÙÙØ§Ø³ Ø¨ØªØªØ­Ø³Ø¨ ØªÙÙÙØ© Ø§ÙØªØ±ÙÙØ¨ Ø¨Ø§ÙÙØªØ± Ø§ÙÙØ±Ø¨Ø¹ Ø­Ø³Ø¨ Ø§ÙÙÙØ§Ø³ Ø§ÙÙØ¹ÙÙØ ÙØ¨ÙØªÙ Ø§ÙØ§ØªÙØ§Ù Ø¹ÙÙ Ø§ÙØªÙÙÙØ© Ø§ÙÙÙØ§Ø¦ÙØ© ÙØ¨Ù Ø¨Ø¯Ø¡ Ø§ÙØ´ØºÙ. Ø³Ø¹Ø± Ø§ÙÙÙÙÙ ÙÙØ³Ù Ø¨Ø§ÙÙØªØ± Ø§ÙØ·ÙÙÙ Ø²Ù ÙØ§ ÙÙ ÙÙØ¶Ø­ ÙÙ Ø§ÙØµÙØ­Ø©.' as const
export const DEFAULT_WHATSAPP_MESSAGE = 'ÙØ±Ø­Ø¨ÙØ§Ø ÙØ­ØªØ§Ø¬ ÙØ¹Ø§ÙÙØ© ÙØ¨Ù Ø§ÙØªØ±ÙÙØ¨ ÙÙÙÙØªØ¬ {product}. Ø§ÙÙÙØ§Ø³Ø§Øª: {measurements}. Ø¹Ø§Ø±Ù Ø¥Ù ØªÙÙÙØ© Ø§ÙØªØ±ÙÙØ¨ Ø¨ØªØªØ­Ø³Ø¨ Ø¨Ø§ÙÙØªØ± Ø§ÙÙØ±Ø¨Ø¹ Ø¨Ø¹Ø¯ Ø§ÙÙÙØ§Ø³ Ø§ÙÙØ¹ÙÙØ ÙØ¹Ø§ÙØ² Ø£Ø¹Ø±Ù Ø§ÙØªÙÙÙØ© Ø§ÙÙÙØ§Ø¦ÙØ© ÙÙØªÙÙ Ø¹ÙÙÙØ§ ÙØ¨Ù ÙØ§ ÙØ¨Ø¯Ø£ Ø§ÙØ´ØºÙ. Ø³Ø¹Ø± Ø§ÙÙÙÙÙ ÙÙØ³Ù Ø¨Ø§ÙÙØªØ± Ø§ÙØ·ÙÙÙ Ø­Ø³Ø¨ Ø§ÙØµÙØ­Ø©. {link}' as const

/**
 * INSTALLER-ONLY (ÙØ±Ø§Ø± Ø§ÙÙØ§ÙÙ 2026-11-05) â Ø·Ø±ÙÙØ© Ø§ÙØªØ±ÙÙØ¨ ÙÙ ØµÙØ­Ø© Â«ÙÙÙ Ø§ÙØªØ±ÙÙØ¨Â» ÙÙ Ø§ÙÙÙØ­Ø©:
 *   choice              Ø§ÙØ¹ÙÙÙ ÙØ®ØªØ§Ø± (Ø²Ù ÙØ§ ÙÙ â Ø§ÙØ§ÙØªØ±Ø§Ø¶ÙØ ÙØ§ÙØ¥Ø¹Ø¯Ø§Ø¯ Ø§ÙÙØ¯ÙÙ ÙÙ ØºÙØ± mode)
 *   installer_all       ÙÙÙ ÙÙØ· ÙÙÙ Ø£ÙÙØ§Ù Ø§ÙÙÙØ§Ø³
 *   installer_products  ÙÙÙ ÙÙØ· ÙÙÙÙØªØ¬Ø§Øª ÙÙ installerOnlyProductIds
 */
export const INSTALLATION_MODES = ['choice', 'installer_all', 'installer_products'] as const
export type InstallationMode = (typeof INSTALLATION_MODES)[number]
export const INSTALLER_ONLY_MAX_PRODUCTS = 500

export function isInstallationMode(value: unknown): value is InstallationMode {
  return typeof value === 'string' && (INSTALLATION_MODES as readonly string[]).includes(value)
}

/** ÙØ¹Ø±ÙÙØ§Øª ÙÙØªØ¬Ø§Øª: Ø£Ø±ÙØ§Ù ØµØ­ÙØ­Ø© ÙÙØ¬Ø¨Ø© ÙÙ ØºÙØ± ØªÙØ±Ø§Ø±Ø Ø¨Ø§ÙØªØ±ØªÙØ¨Ø ÙØ­Ø¯ Ø§ÙØ£ÙØµÙ. Ø£Ù ÙÙÙØ© ØºÙØ· Ø¨ØªØªØ´Ø§Ù. */
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

/** { ÙØ­Ø§ÙØ¸Ø©: { ÙÙØ·ÙØ©: Ø§ÙØªÙØ§Ù Ø§ÙÙÙÙ Ø¨Ø§ÙÙØ±Ø´ } } â Ø§ÙÙÙØ·ÙØ© Ø§ÙÙÙØ¬ÙØ¯Ø© ÙÙØ§ = ÙØªØ§Ø­Ø© ÙÙÙÙÙ. */
export type InstallationAreas = Record<string, Record<string, number>>

export type InstallationConfig = {
  enabled: boolean
  note: string
  /** null = ÙØ³Ù ÙØªØ­Ø¯Ø¯Ø´Ø ÙØ§ÙÙÙÙ ÙØ´ ÙØªØ§Ø­ ÙØ­Ø¯ ÙØ§ ÙØªÙØªØ¨. */
  feePerSquareMeterPiastres: number | null
  areas: InstallationAreas
  /** INSTALLER-ONLY â ÙØ§ÙØµ = 'choice' (Ø§ÙØ¹ÙÙÙ ÙØ®ØªØ§Ø±). */
  mode?: InstallationMode
  /** INSTALLER-ONLY â Ø£ÙÙØ§Ù Â«ÙÙÙ ÙÙØ·Â» ÙÙØ§ mode = 'installer_products'. */
  installerOnlyProductIds?: number[]
  /** Ø±Ø³Ø§ÙØ© Ø§ÙÙØ¹Ø§ÙÙØ© (Ø¨ØªØ¸ÙØ± ÙÙØ¹ÙÙÙ Ø¹ÙØ¯ Ø§Ø®ØªÙØ§Ø± Ø§ÙÙØ¹Ø§ÙÙØ©). */
  inspectionNote?: string
  whatsappMessage?: string;
}

/** Ø±ÙÙ ØµØ­ÙØ­ Ø¨Ø§ÙÙØ±Ø´ ÙÙ min ÙØ­Ø¯ Ø§ÙØ£ÙØµÙ â ÙÙØ³ Ø­Ø¯ÙØ¯ zell_create_order. */
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
  const fee = raw['feePerSquareMeterPiastres']
  const mode = raw['mode']
  const inspectionNote = typeof raw['inspectionNote'] === 'string' 
    ? raw['inspectionNote'].trim().substring(0, INSTALLATION_LIMITS.inspectionNote)
    : DEFAULT_INSPECTION_NOTE
  const whatsappMessage = typeof raw['whatsappMessage'] === 'string'
    ? raw['whatsappMessage'].trim().substring(0, INSTALLATION_LIMITS.whatsappMessage)
    : DEFAULT_WHATSAPP_MESSAGE
  
  return {
    enabled: raw['enabled'] === true,
    note: typeof raw['note'] === 'string' ? raw['note'] : '',
    inspectionNote: inspectionNote || DEFAULT_INSPECTION_NOTE,
    whatsappMessage: whatsappMessage || DEFAULT_WHATSAPP_MESSAGE,
    feePerSquareMeterPiastres: isInstallationMoney(fee, 1) ? fee : null,
    areas,
    mode: isInstallationMode(mode) ? mode : 'choice',
    installerOnlyProductIds: parseInstallerOnlyIds(raw['installerOnlyProductIds']),
  }
}

/** Ø§ÙÙØ­Ø§ÙØ¸Ø§Øª Ø§ÙÙÙ ÙÙÙØ§ ÙÙØ·ÙØ© ÙÙØ¹ÙÙØ© ÙØ§Ø­Ø¯Ø© Ø¹ÙÙ Ø§ÙØ£ÙÙØ Ø¨ØªØ±ØªÙØ¨ areas. */
export function installationGovernorates(areas: InstallationAreas): string[] {
  return Object.keys(areas).filter((governorate) => Object.keys(areas[governorate] ?? {}).length > 0)
}

/**
 * Ø·ÙÙ Ø§ÙØªØ±ÙÙØ¨ = ÙØ¬ÙÙØ¹ Ø£Ø·ÙØ§Ù Ø³Ø·ÙØ± Ø§ÙÙÙØ§Ø³ Ø¨Ø§ÙØ³ÙØªÙÙØªØ±. Ø§ÙÙÙØªØ¬Ø§Øª Ø¨Ø§ÙØ¹Ø¯Ø¯ ÙØ´ Ø¯Ø§Ø®ÙØ© â
 * ÙÙØ³ zell_create_order (sum(length_cm) filter (where sale_unit = 'meter')).
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
 * Ø£Ø¬Ø± Ø§ÙØªØ±ÙÙØ¨ Ø¨Ø§ÙÙØ±Ø´ = round(Ø³Ø¹Ø± Ø§ÙÙØªØ± Ã Ø§ÙØ·ÙÙ Ã· Ù¡Ù Ù ) Ø¨Ø£Ø±ÙØ§Ù ØµØ­ÙØ­Ø© ÙÙ ØºÙØ± float.
 * Ø§ÙÙÙÙ ÙÙØ¬Ø¨Ø©Ø ÙØ§ÙÙØµ Ø¨ÙØªÙØ±Ø¨ ÙÙÙÙ â ÙÙØ³ round(numeric) ÙÙ zell_create_order Ø¨Ø§ÙØ­Ø±Ù.
 * ÙÙØ¹Ø±Ø¶ Ø¨Ø³Ø Ø§ÙØ±ÙÙ Ø§ÙÙØ¹ØªÙØ¯ ÙÙ Ø§ÙØ¯Ø§ØªØ§Ø¨ÙØ².
 */
export function installationFeePiastres(feePerSquareMeterPiastres: number, lengthCm: number): number {
  if (!Number.isInteger(feePerSquareMeterPiastres) || !Number.isInteger(lengthCm)) return 0
  if (feePerSquareMeterPiastres <= 0 || lengthCm <= 0) return 0
  const lengthM = lengthCm / 100; const widthM = rollWidthCm / 100; const areaSqm = lengthM * widthM; const product = feePerSquareMeterPiastres * areaSqm
  const rest = product % 100
  return (product - rest) / 100 + (rest >= 50 ? 1 : 0)
}

/** Ø§ÙÙÙØ§Ø·Ù Ø§ÙÙØªØ§Ø­Ø© ÙÙÙÙÙ ÙÙ ÙØ­Ø§ÙØ¸Ø© â ÙØ§Ø¶ÙØ© ÙÙ Ø§ÙÙÙÙ ÙÙÙÙÙ Ø£Ù Ø³Ø¹Ø± Ø§ÙÙØªØ± ÙØ§ÙØµ. */
export function installationAreasIn(config: InstallationConfig, governorate: string): string[] {
  if (!config.enabled || config.feePerSquareMeterPiastres === null) return []
  return Object.keys(config.areas[governorate] ?? {})
}

/** Ø§ÙØªÙØ§Ù Ø§ÙÙÙÙ ÙÙÙØ·ÙØ© Ø¨Ø§ÙÙØ±Ø´ â null = Ø§ÙÙÙÙ ÙØ´ ÙØªØ§Ø­ ÙÙØ§Ù. */
export function installationTravelPiastres(config: InstallationConfig, governorate: string, area: string): number | null {
  if (!config.enabled || config.feePerSquareMeterPiastres === null) return null
  const travel = config.areas[governorate]?.[area]
  return travel === undefined ? null : travel
}

/** Ø§ÙÙØ­Ø§ÙØ¸Ø§Øª Ø§ÙÙÙ ÙÙÙØ§ ÙÙØ·ÙØ© ÙØªØ§Ø­Ø© ÙÙÙÙÙ â ÙØ§Ø¶ÙØ© ÙÙ Ø§ÙÙÙÙ ÙÙÙÙÙ Ø£Ù Ø³Ø¹Ø± Ø§ÙÙØªØ± ÙØ§ÙØµ. */
export function installationReadyGovernorates(config: InstallationConfig): string[] {
  if (!config.enabled || config.feePerSquareMeterPiastres === null) return []
  return installationGovernorates(config.areas)
}

/**
 * INSTALLER-ONLY (ÙØ±Ø§Ø± Ø§ÙÙØ§ÙÙ 2026-11-05) â Ø§ÙÙÙØªØ¬ Ø¯Ù Â«ÙÙÙ ÙÙØ·Â»Ø Ø¹Ø±Ø¶ Ø¨Ø³: zell_create_order ÙØ§ÙÙØ§Ø´ Ø¯Ø¹ÙØ© Ø¨ÙÙ.
 * Ø¨Ø³ ÙÙØ§ Ø§ÙÙÙÙ ÙØªØ§Ø­ ÙØ¹ÙÙØ§ (installationReadyGovernorates ÙØ´ ÙØ§Ø¶ÙØ©) â ÙÙ Ø§ÙØ®Ø¯ÙØ© ÙÙÙÙÙØ© Ø£Ù ÙØ§ÙÙØ§Ø´ Ø³Ø¹Ø± Ø£Ù ÙÙØ§Ø·ÙØ
 * ÙÙ Ø­Ø§Ø¬Ø© Ø´ØºØ§ÙØ© Ø²Ù ÙØ§ ÙÙ ÙØ§ÙØ¹ÙÙÙ Ø¨ÙØ®ØªØ§Ø± Ø¹Ø§Ø¯Ù.
 */
export function installerRequiredFor(config: InstallationConfig, productId: number): boolean {
  if (installationReadyGovernorates(config).length === 0) return false
  if (config.mode === 'installer_all') return true
  if (config.mode === 'installer_products') return (config.installerOnlyProductIds ?? []).includes(productId)
  return false
}

/**
 * INSTALLER-ONLY â Ø§ÙØ·ÙØ¨ ÙÙÙ Â«ÙÙÙ ÙÙØ·Â» ÙÙ ÙÙÙ ÙÙØªØ¬ Ø¨Ø§ÙÙÙØ§Ø³ ÙØ§Ø­Ø¯ Â«ÙÙÙ ÙÙØ·Â» (Ø§ÙØ§Ø®ØªÙØ§Ø± ÙØ§Ø­Ø¯ ÙÙØ·ÙØ¨ ÙÙÙ).
 * ÙÙØªØ¬Ø§Øª Ø§ÙÙØ·Ø¹Ø© (Ø§ÙØ£Ø¯ÙØ§Øª) ÙØ´ Ø¯Ø§Ø®ÙØ©.
 */
export function orderRequiresInstaller(
  config: InstallationConfig,
  products: ReadonlyArray<{ id: number; sale_unit?: string }>,
): boolean {
  return products.some((product) => product.sale_unit !== 'piece' && installerRequiredFor(config, product.id))
}
