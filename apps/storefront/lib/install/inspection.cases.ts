/**
 * حالات اختبار ميزة المعاينة.
 *
 * التشغيل: pnpm --filter @zell/storefront cases suite inspection
 */

import { DEFAULT_INSPECTION_NOTE, DEFAULT_WHATSAPP_MESSAGE, parseInstallationConfig } from '@zell/core'
import { buildInspectionMessage, buildWhatsAppUrl } from './inspection'
import { SITE_URL } from '../site'

export type InspectionCaseFailure = { name: string; expected: string; actual: string }

export function runInspectionCases(): { passed: number; failures: InspectionCaseFailure[] } {
  const failures: InspectionCaseFailure[] = []
  let passed = 0

  function check(name: string, actual: unknown, expected: unknown): void {
    const a = JSON.stringify(actual)
    const e = JSON.stringify(expected)
    if (a === e) passed += 1
    else failures.push({ name, expected: e, actual: a })
  }

  // حالات اختبار بناء الرسالة

  const withDimensions = buildInspectionMessage('فيلم مصنفر', { length: 300, width: 100 }, 2)
  check(
    'buildInspectionMessage: القالب الافتراضي مع مقاسات',
    withDimensions,
    DEFAULT_WHATSAPP_MESSAGE.replaceAll('{product}', 'فيلم مصنفر').replaceAll('{measurements}', '300×100').replaceAll('{link}', SITE_URL + '/product/2')
  )
  check('buildInspectionMessage: المقاسات مرة واحدة', withDimensions.split('المقاسات: 300×100.').length - 1, 1)
  check('buildInspectionMessage: مفيش أقواس متبقية', withDimensions.includes('{'), false)

  const withoutDimensions = buildInspectionMessage('فيلم مصنفر', undefined, 2)
  check('buildInspectionMessage: بدون مقاسات — مفيش «المقاسات»', withoutDimensions.includes('المقاسات'), false)
  check('buildInspectionMessage: بدون مقاسات — مفيش مسافتين ورا بعض', withoutDimensions.includes('  '), false)
  check(
    'buildInspectionMessage: بدون مقاسات — فيه المنتج والرابط',
    withoutDimensions.includes('فيلم مصنفر') && withoutDimensions.includes(SITE_URL + '/product/2'),
    true
  )

  const duplicatedWithoutDimensions = buildInspectionMessage('فيلم مصنفر', undefined, 2, 'أهلًا {product}. المقاسات: {measurements}. المقاسات: {measurements}. {link}')
  check('buildInspectionMessage: بدون مقاسات — جملة المقاسات المكررة بتتشال كلها', duplicatedWithoutDimensions.includes('المقاسات'), false)

  check(
    'buildInspectionMessage: قالب مخصص مع مقاسات',
    buildInspectionMessage('فيلم مصنفر', { length: 300, width: 100 }, 2, 'أهلًا، عايز معاينة لـ{product} ({measurements}) {link}'),
    'أهلًا، عايز معاينة لـفيلم مصنفر (300×100) ' + SITE_URL + '/product/2'
  )

  let unknownPlaceholder = ''
  try {
    unknownPlaceholder = buildInspectionMessage('فيلم مصنفر', { length: 300, width: 100 }, 2, 'أهلًا، عايز معاينة لـ{product} {foo} {link}')
  } catch {
    unknownPlaceholder = ''
  }
  check('buildInspectionMessage: قالب فيه {foo} مجهول — {foo} بتفضل زي ما هي', unknownPlaceholder.includes('{foo}'), true)

  // حالات اختبار بناء رابط الواتساب

  const waUrl = buildWhatsAppUrl('201099137788', withDimensions)
  check('buildWhatsAppUrl: بيبدأ بـ wa.me', waUrl.startsWith('https://wa.me/201099137788?text='), true)
  check('buildWhatsAppUrl: النص بيتفك زي ما هو', decodeURIComponent(waUrl.replace('https://wa.me/201099137788?text=', '')), withDimensions)

  // حالات اختبار إعدادات التركيب الافتراضية

  check('parseInstallationConfig: الإعدادات الافتراضية — inspectionNote', parseInstallationConfig({}).inspectionNote, DEFAULT_INSPECTION_NOTE)
  check('parseInstallationConfig: الإعدادات الافتراضية — whatsappMessage', parseInstallationConfig({}).whatsappMessage, DEFAULT_WHATSAPP_MESSAGE)

  return { passed, failures }
}
