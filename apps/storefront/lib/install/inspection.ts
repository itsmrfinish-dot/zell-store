/**
 * Ø±Ø³Ø§ÙØ© Ø§ÙÙØ¹Ø§ÙÙØ© ÙØ§ÙÙØ§ØªØ³Ø§Ø¨ â ÙÙØ²Ø© Â«Ø·ÙØ¨ ÙØ¹Ø§ÙÙØ© ÙØ¨Ù Ø§ÙØªØ±ÙÙØ¨Â» ÙÙ ØµÙØ­Ø© Ø§ÙÙÙØªØ¬.
 *
 * Ø§ÙØ±Ø³Ø§ÙØ© = Ø§ÙØ³Ø·Ø± Ø§ÙØ«Ø§Ø¨Øª + Ø§Ø³Ù Ø§ÙÙÙØªØ¬ + Ø§ÙÙÙØ§Ø³Ø§Øª (ÙÙ ÙÙØ¬ÙØ¯Ø©) + Ø±Ø§Ø¨Ø· ØµÙØ­Ø© Ø§ÙÙÙØªØ¬.
 */

import { SITE_URL } from '../site'

/**
 * Ø¨ÙØ§Ø¡ Ø±Ø³Ø§ÙØ© Ø§ÙÙØ§ØªØ³Ø§Ø¨ ÙØ·ÙØ¨ ÙØ¹Ø§ÙÙØ© Ø§ÙØªØ±ÙÙØ¨.
 *
 * @param productName â Ø§Ø³Ù Ø§ÙÙÙØªØ¬
 * @param dimensions â Ø§ÙÙÙØ§Ø³Ø§Øª (Ø·ÙÙÃØ¹Ø±Ø¶) Ø£Ù undefined
 * @param productId â ÙØ¹Ø±ÙÙ Ø§ÙÙÙØªØ¬
 * @returns Ø§ÙØ±Ø³Ø§ÙØ© Ø§ÙÙØ§ÙÙØ© Ø§ÙØ¬Ø§ÙØ²Ø© ÙÙØ¥Ø±Ø³Ø§Ù
 */
export function buildInspectionMessage(
  productName: string,
  dimensions: { length?: number; width?: number } | undefined,
  productId: number,
  inspectionNote?: string
): string {
  const lines: string[] = ['ÙØ­ØªØ§Ø¬ ÙØ¹Ø§ÙÙØ© ÙØ¨Ù Ø§ÙØªØ±ÙÙØ¨']
  
  if (inspectionNote) {
    lines.push(inspectionNote)
  }
  
  lines.push(`Ø§ÙÙÙØªØ¬: ${productName}`)

  if (dimensions?.length !== undefined && dimensions?.width !== undefined) {
    lines.push(`Ø§ÙÙÙØ§Ø³Ø§Øª: ${dimensions.length}Ã${dimensions.width}`)
  }

  lines.push(`Ø§ÙØ±Ø§Ø¨Ø·: ${SITE_URL}/product/${productId}`)

  return lines.join('\n')
}

/**
 * Ø¨ÙØ§Ø¡ Ø±Ø§Ø¨Ø· Ø§ÙÙØ§ØªØ³Ø§Ø¨ Ø§ÙÙØ§ÙÙ.
 *
 * @param phoneNumber â Ø±ÙÙ Ø§ÙÙØ§ØªØ³Ø§Ø¨ Ø¨Ø¯ÙÙ + (ÙØ«Ø§Ù: 20...)
 * @param message â Ø§ÙØ±Ø³Ø§ÙØ©
 * @returns Ø±Ø§Ø¨Ø· wa.me Ø§ÙÙØ§ÙÙ
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}
