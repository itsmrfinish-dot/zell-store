/**
 * رسالة المعاينة والواتساب — ميزة «طلب معاينة قبل التركيب» في صفحة المنتج.
 *
 * الرسالة = السطر الثابت + اسم المنتج + المقاسات (لو موجودة) + رابط صفحة المنتج.
 */

import { SITE_URL } from '../site'

/**
 * بناء رسالة الواتساب لطلب معاينة التركيب.
 *
 * @param productName — اسم المنتج
 * @param dimensions — المقاسات (طول×عرض) أو undefined
 * @param productId — معرّف المنتج
 * @returns الرسالة الكاملة الجاهزة للإرسال
 */
export function buildInspectionMessage(
  productName: string,
  dimensions: { length?: number; width?: number } | undefined,
  productId: number
): string {
  const lines: string[] = ['محتاج معاينة قبل التركيب', `المنتج: ${productName}`]

  if (dimensions?.length !== undefined && dimensions?.width !== undefined) {
    lines.push(`المقاسات: ${dimensions.length}×${dimensions.width}`)
  }

  lines.push(`الرابط: ${SITE_URL}/product/${productId}`)

  return lines.join('\n')
}

/**
 * بناء رابط الواتساب الكامل.
 *
 * @param phoneNumber — رقم الواتساب بدون + (مثال: 20...)
 * @param message — الرسالة
 * @returns رابط wa.me الكامل
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}
