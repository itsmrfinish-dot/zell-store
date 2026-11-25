/**
 * â ï¸â ï¸ FALLBACK ÙØ¤ÙØª â **ÙØ´ ÙØµØ¯Ø± Ø¨ÙØ§ÙØ§Øª**. â ï¸â ï¸
 *
 * ÙØ³Ø®Ø© ÙØ¬ÙÙØ¯Ø© Ø¨Ø§ÙÙØ¯ ÙÙ ØµÙÙÙ Production ÙÙØª ÙØªØ§Ø¨Ø© Ø§ÙÙØ±Ø­ÙØ© Ø§ÙØ£ÙÙÙØ Ø¹Ø´Ø§Ù
 * Ø§ÙÙØ§Ø¬ÙØ© ØªØªØ¨ÙÙ ÙØªØªØ±Ø§Ø¬Ø¹ Ø¨Ø£Ø±ÙØ§Ù Ø­ÙÙÙÙØ© ÙÙ ØºÙØ± Ø£Ù ÙÙØªØ§Ø­ Supabase ÙÙ Ø§ÙØ±ÙØ¨Ù.
 *
 *   â¢ Ø§ÙØ£Ø±ÙØ§Ù Ø¨ØªÙØ¯Ù ÙÙ ÙØ§ Ø­Ø¯ ÙØ¹Ø¯ÙÙ ÙÙØªØ¬ Ø£Ù Ø³Ø¹Ø± ÙÙ Ø§ÙØ¯Ø§Ø´Ø¨ÙØ±Ø¯.
 *   â¢ ÙÙÙÙØ¹ Ø£Ù ÙÙØ·Ù Ø£Ø¹ÙØ§Ù ÙØ¹ØªÙØ¯ Ø¹ÙÙ Ø§ÙÙÙÙ Ø¯Ù.
 *   â¢ ÙØµÙØ±Ù Ø§ÙØ­Ø°ÙØ ÙØ´ Ø§ÙØªÙØ³Ø¹Ø©.
 *
 * ð« **ÙÙÙØ´ Ø£Ù ÙØ³Ø§Ø± ØµÙØ± ÙÙ Production ÙÙØ§.** Ø§ÙÙØ¹Ø§Ø±Ø¶ ÙØ§Ø¶ÙØ© Ø¹Ù ÙØµØ¯ â
 * Ø§ÙØ±ÙØ§Ø¨Ø· Ø§ÙØ­ÙÙÙÙØ© Ø¨ØªØªØ¨ÙÙ ÙÙ Ø·Ø¨ÙØ© Ø§ÙÙØ±Ø§Ø¡Ø© Ø§ÙÙØ¹ØªÙØ¯Ø© Ø¹ÙÙ Ø§ÙØ³ÙØ±ÙØ±.
 */
import { DEFAULT_INSPECTION_NOTE, DEFAULT_WHATSAPP_MESSAGE } from '@zell/core'
import type { StoreProduct, StoreCollection, StoreSettings } from '@zell/core'
import { DEFAULT_INSTALLATION_TOOLS_PAGE, DEFAULT_STORE_CONTENT, NO_PUBLISHED_POLICIES } from '@zell/core'

export const FALLBACK_PRODUCTS: StoreProduct[] = [
  {
    id: 1,
    name_ar: 'Ø¹Ø§Ø²Ù Ø­Ø±Ø§Ø±Ø©',
    name_en: 'Heat Rejection Window Film',
    brand: null,
    description_ar:
      'Ø§ÙØµØ§ÙØ© Ø£Ù Ø§ÙØ£ÙØ¶Ø© Ø§ÙÙÙ Ø§ÙØ´ÙØ³ Ø¨ØªØ¶Ø±Ø¨ÙØ§ Ø·ÙÙ Ø§ÙÙÙØ§Ø±: Ø¨ÙÙÙÙ Ø§ÙØ­Ø±Ø§Ø±Ø© ÙØ§ÙÙÙØ¬Ø ÙØ§ÙØªÙÙÙÙ ÙØªØ¹Ø¨ Ø£ÙÙØ ÙØ§ÙÙØ±Ø´ ÙØ§ ÙØ¨ÙØªØ´. Ø§ÙØ±Ø¤ÙØ© ÙÙ Ø¬ÙÙ ØªÙØ¶Ù ÙØ§Ø¶Ø­Ø©.',
    gallery: [],
    image_url: null,
    images: [],
    before_image: null,
    after_image: null,
    price_per_meter_piastres: 18000,
    width_cm: 50,
    min_length_cm: 300,
    step_cm: 50,
    max_length_cm: 3000,
  },
  {
    id: 2,
    name_ar: 'ÙØµÙÙØ± (Ø®ØµÙØµÙØ©)',
    name_en: 'Frosted Privacy Film',
    brand: null,
    description_ar:
      'Ø²Ø¬Ø§Ø¬ ÙØ·ÙÙ Ø²Ù Ø§ÙØ³ÙÙØ±Ø© â ÙØ­Ø¯Ø´ ÙØ´ÙÙ ÙÙ Ø¨Ø±Ù ÙØ§ÙÙÙØ± Ø¨ÙØ¯Ø®Ù Ø¹Ø§Ø¯Ù. Ø§ÙØ£ÙØ³Ø¨ ÙÙØ­ÙØ§Ù ÙØ§ÙÙØ·Ø¨Ø® ÙØ§ÙØ£Ø¨ÙØ§Ø¨ Ø§ÙØ²Ø¬Ø§Ø¬ÙØ© Ø§ÙØ¯Ø§Ø®ÙÙØ©.',
    gallery: [],
    image_url: null,
    images: [],
    before_image: null,
    after_image: null,
    price_per_meter_piastres: 12000,
    width_cm: 50,
    min_length_cm: 300,
    step_cm: 50,
    max_length_cm: 3000,
  },
  {
    id: 3,
    name_ar: 'ÙØ§ÙÙÙ Ø£Ø³ÙØ¯',
    name_en: 'Black Smoked Film',
    brand: null,
    description_ar:
      'ØªØ¹ØªÙÙ ÙÙÙ ÙØ®ØµÙØµÙØ© ÙØ§ÙÙØ© ÙÙ Ø¨Ø±ÙØ ÙØ¨ÙÙÙÙ Ø§ÙØ´ÙØ³ ÙØ§ÙÙÙØ¬ ÙÙØ§Ù. ÙÙØ§Ø³Ø¨ ÙÙØ¨ÙÙÙÙØ© ÙØ§ÙØ´Ø¨Ø§Ø¨ÙÙ Ø§ÙÙØ·ÙØ© Ø¹ÙÙ Ø§ÙØ´Ø§Ø±Ø¹.',
    gallery: [],
    image_url: null,
    images: [],
    before_image: null,
    after_image: null,
    price_per_meter_piastres: 20000,
    width_cm: 50,
    min_length_cm: 300,
    step_cm: 50,
    max_length_cm: 3000,
  },
]

/** Ø§ÙÙÙØªØ¬ Ø±ÙÙ Ù¤ (Ø£ÙØ§Ù/Ø³ÙÙÙÙØ±ØªÙ) ØºÙØ± ÙØ´Ø· ÙÙ Production ÙÙØ´ ÙØ¹Ø±ÙØ¶ ÙÙØ§ â ÙØ±Ø§Ø± ÙØ¹ØªÙØ¯. */

const FALLBACK_SHIPPING_RATES: Record<string, number> = {
  Ø§ÙÙØ§ÙØ±Ø©: 5000,
  Ø§ÙØ¬ÙØ²Ø©: 5000,
  Ø§ÙÙÙÙÙØ¨ÙØ©: 6000,
  Ø§ÙØ´Ø±ÙÙØ©: 7000,
  Ø§ÙØºØ±Ø¨ÙØ©: 7000,
  Ø§ÙØ¯ÙÙÙÙØ©: 7000,
  Ø§ÙÙÙÙÙÙØ©: 7000,
  Ø§ÙØ¥Ø³ÙÙØ¯Ø±ÙØ©: 7000,
  Ø§ÙØ¨Ø­ÙØ±Ø©: 8000,
  'ÙÙØ± Ø§ÙØ´ÙØ®': 8000,
  Ø¯ÙÙØ§Ø·: 8000,
  Ø¨ÙØ±Ø³Ø¹ÙØ¯: 8000,
  Ø§ÙØ¥Ø³ÙØ§Ø¹ÙÙÙØ©: 8000,
  Ø§ÙØ³ÙÙØ³: 8000,
  Ø§ÙÙÙÙÙ: 8000,
  'Ø¨ÙÙ Ø³ÙÙÙ': 8000,
  Ø§ÙÙÙÙØ§: 9000,
  Ø£Ø³ÙÙØ·: 9000,
  Ø³ÙÙØ§Ø¬: 9000,
  ÙÙØ§: 10000,
  Ø§ÙØ£ÙØµØ±: 10000,
  Ø£Ø³ÙØ§Ù: 11000,
  ÙØ·Ø±ÙØ­: 12000,
  'Ø§ÙØ¨Ø­Ø± Ø§ÙØ£Ø­ÙØ±': 12000,
  'Ø§ÙÙØ§Ø¯Ù Ø§ÙØ¬Ø¯ÙØ¯': 13000,
  'Ø´ÙØ§Ù Ø³ÙÙØ§Ø¡': 13000,
  'Ø¬ÙÙØ¨ Ø³ÙÙØ§Ø¡': 13000,
}

export const FALLBACK_SETTINGS: StoreSettings = {
  storeName: 'myzill',
  logo: null,
  heroImage: null,
  logoUrl: '',
  offerText: 'Ø£Ø¯ÙØ§Øª Ø§ÙØªØ±ÙÙØ¨ ÙØ±ÙÙØ© ÙØ¬Ø§ÙØ§Ù',
  offerEnabled: true,
  installation: {
    inspectionNote: DEFAULT_INSPECTION_NOTE, whatsappMessage: DEFAULT_WHATSAPP_MESSAGE, enabled: false, note: '', feePerMeterPiastres: null, areas: {} },
  whatsappNumber: '201000000000',
  whatsappMessage: 'ÙØ±Ø­Ø¨Ø§Ù myzillØ Ø¹Ø§ÙØ² Ø£Ø³ØªÙØ³Ø± Ø¹Ù ÙÙÙÙ Ø²Ø¬Ø§Ø¬ ÙÙØ¨ÙØª',
  shippingRates: FALLBACK_SHIPPING_RATES,
  shippingDefaultPiastres: 8000,
  freeShippingThresholdPiastres: 0,
  governorates: Object.keys(FALLBACK_SHIPPING_RATES),
  shippingAreas: {},
  homeProducts: { mode: 'all', ids: [], allLabel: 'ÙÙ Ø§ÙØ£ÙÙØ§Ù' },
  socialLinks: [],
  addonsTitle: 'Ø£Ø¯ÙØ§Øª Ø§ÙØªØ±ÙÙØ¨',
  installationToolsPage: DEFAULT_INSTALLATION_TOOLS_PAGE,
  // Ø§ÙÙØªØ§ÙÙØ¬ Ø§ÙÙØ¤ÙØª ÙØ§ÙÙÙÙØ´ ØµÙØ­Ø§Øª Ø³ÙØ§Ø³Ø§Øª ÙÙØ´ÙØ±Ø©
  policies: NO_PUBLISHED_POLICIES,
  // Ø§ÙÙØªØ§ÙÙØ¬ Ø§ÙÙØ¤ÙØª ÙØ§ÙÙÙÙØ´ Ø£ÙÙØ§Ø¯ Ø®ØµÙ
  couponsEnabled: false,
  // Ø§ÙÙØªØ§ÙÙØ¬ Ø§ÙÙØ¤ÙØª ÙØ§Ø¨ÙØ¹Ø±Ø¶Ø´ Ø´Ø±ÙØ· â Ø§ÙØ´Ø±ÙØ· Ø¨ÙØ§ÙØ§Øª Ø­ÙÙÙÙØ© ÙÙ settings Ø¨Ø³
  announcement: { enabled: false, text: '', href: '', ctaLabel: '' },
  content: DEFAULT_STORE_CONTENT,
  get storeIdentity() {
    return {
      storeName: this.storeName,
      offerText: this.offerText,
      offerEnabled: this.offerEnabled,
      whatsappNumber: this.whatsappNumber,
      whatsappMessage: this.whatsappMessage,
      inspectionEnabled: true,
    };
  },
}

/**
 * Ø§ÙÙØªØ§ÙÙØ¬ Ø§ÙÙØ¤ÙØª **ÙØ§ÙÙØ´ ÙØ¬ÙÙØ¹Ø§Øª**.
 *
 * Ø§ÙÙØ¬ÙÙØ¹Ø§Øª Ø¨ÙØ§ÙØ§Øª Ø­ÙÙÙÙØ© Ø¨ÙØ¯Ø®ÙÙÙØ§ Ø§ÙØ£Ø¯ÙÙØ ÙÙÙÙØ´ ÙØ¹ÙÙ ÙØ§Ø®ØªØ±Ø§Ø¹
 * ÙØ¬ÙÙØ¹Ø§Øª ÙÙÙÙØ© â Ø§ÙØ±Ø¦ÙØ³ÙØ© Ø¨Ø¨Ø³Ø§Ø·Ø© ÙØ§Ø¨ØªØ¹Ø±Ø¶Ø´ ÙØ³Ù ÙØ¬ÙÙØ¹Ø§Øª ÙÙ ÙØ¶Ø¹
 * fallback. Ø¯Ù ÙÙ Ø§ÙÙØ¶Ø¹ Ø§ÙÙÙ CI Ø¨ÙØ¨ÙÙ Ø¨ÙÙØ ÙØ§ÙØ¨ÙØ§Ø¡ Ø¨ÙØºØ·Ù Ø§ÙØ­Ø§ÙØ©
 * Ø§ÙÙØ§Ø¶ÙØ© ÙØ¹ÙÙÙØ§.
 */
export const FALLBACK_COLLECTIONS: StoreCollection[] = []

export function getFallbackCollections(): StoreCollection[] {
  return FALLBACK_COLLECTIONS
}

/** Ø§ÙØ£Ø³ÙØ§Ø¡ ÙÙØªÙØ¨Ø© Ø¨Ù Fallback Ø¹Ù ÙØµØ¯ â Ø¹Ø´Ø§Ù ÙÙØ§Ù Ø§ÙØ§Ø³ØªØ¯Ø¹Ø§Ø¡ ÙÙØ¶Ø­ Ø¥ÙÙØ§ ÙØ¤ÙØªØ©. */
export function getFallbackProducts(): StoreProduct[] {
  return FALLBACK_PRODUCTS
}

export function getFallbackProductById(id: number): StoreProduct | undefined {
  return FALLBACK_PRODUCTS.find((product) => product.id === id)
}

export function getFallbackSettings(): StoreSettings {
  return FALLBACK_SETTINGS
}
