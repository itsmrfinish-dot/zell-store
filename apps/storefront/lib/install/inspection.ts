/**
 * رسالة المعاينة والواتساب – نسخة «طلب معاينة قبل التركيب» في صفحة المنتج.
 *
 * الرسالة = السطر الثابت + اسم المنتج + المقاسات (من موجودة) + رابط صفحة المنتج.
 */

import { DEFAULT_WHATSAPP_MESSAGE } from '@zell/core'
import { SITE_URL } from '../site'

/**
 * بناء رسالة الواتساب لطلب معاينة التركيب.
 *
 * @param productName – اسم المنتج
 * @param dimensions – المقاسات (طول×عرض) أو undefined
 * @param productId – معرّف المنتج
 * @param whatsappTemplate – قالب الواتساب المخصص أو undefined (يستخدم الافتراضي)
 * @returns الرسالة النهائية الجاهزة للإرسال
 */
export function buildInspectionMessage(
  productName: string,
  dimensions: { length?: number; width?: number } | undefined,
  productId: number,
  whatsappTemplate?: string
): string {
  // بناء المقاسات
  let measurements = '';
  if (dimensions?.length !== undefined && dimensions?.width !== undefined) {
    measurements = `${dimensions.length}×${dimensions.width}`;
  }

  // بناء الرابط
  const link = `${SITE_URL}/product/${productId}`;

  // بناء الرسالة من القالب
  let template = whatsappTemplate || DEFAULT_WHATSAPP_MESSAGE;
  if (measurements === '') {
    template = template.replaceAll('المقاسات: {measurements}.', '');
  }
  
  let message = template
    .replaceAll('{product}', productName)
    .replaceAll('{measurements}', measurements)
    .replaceAll('{link}', link);

  // تنظيف المسافات الزائدة (فراغات مزدوجة أو مبتورة)
  message = message.replace(/\s+/g, ' ').trim();

  return message;
}

/**
 * بناء رابط الواتساب النهائي.
 *
 * @param phoneNumber – رقم الواتساب بدون + (مثلاً: 20...)
 * @param message – الرسالة
 * @returns رابط wa.me النهائي
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
