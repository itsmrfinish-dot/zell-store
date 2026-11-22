/**
 * حالات اختبار نسخة الرسالتين.
 *
 * التشغيل: pnpm --filter @zell/storefront cases suite inspection
 */

import { buildInspectionMessage, buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from './inspection'

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

  // حالات اختبار القالب الافتراضي

  check(
    'buildInspectionMessage: default template with measurements',
    buildInspectionMessage('شاشة', { length: 100, width: 50 }, 1, undefined),
    'مرحبًا، محتاج معاينة قبل التركيب للمنتج شاشة. المقاسات: 100×50 عارف إن تكلفة التركيب بتتحسب بالمتر المربع بعد القياس الفعلي، وعايز أعرف التكلفة النهائية ونتفق عليها قبل ما يبدأ الشغل. سعر الفيلم نفسه بالمتر الطولي حسب الصفحة. https://myzill.com/product/1'
  )

  check(
    'buildInspectionMessage: default template without measurements',
    buildInspectionMessage('عازل حرارة', undefined, 2, undefined),
    'مرحبًا، محتاج معاينة قبل التركيب للمنتج عازل حرارة. عارف إن تكلفة التركيب بتتحسب بالمتر المربع بعد القياس الفعلي، وعايز أعرف التكلفة النهائية ونتفق عليها قبل ما يبدأ الشغل. سعر الفيلم نفسه بالمتر الطولي حسب الصفحة. https://myzill.com/product/2'
  )

  // حالات اختبار القالب المخصص

  check(
    'buildInspectionMessage: custom template replaces placeholders',
    buildInspectionMessage('منتج', { length: 100, width: 50 }, 1, 'عايز معاينة للمنتج {product} بـ {measurements} والرابط {link}'),
    'عايز معاينة للمنتج منتج بـ المقاسات: 100×50 والرابط https://myzill.com/product/1'
  )

  check(
    'buildInspectionMessage: custom template without measurements',
    buildInspectionMessage('منتج', undefined, 1, 'المنتج: {product} - الرابط: {link}'),
    'المنتج: منتج - الرابط: https://myzill.com/product/1'
  )

  // اختبار العنصر النائب غير المعروف

  check(
    'buildInspectionMessage: unknown placeholder stays literal',
    buildInspectionMessage('منتج', undefined, 1, 'المنتج: {product} والسعر: {price}'),
    'المنتج: منتج والسعر: {price}'
  )

  // اختبار تنظيف المسافات الزائدة

  check(
    'buildInspectionMessage: cleanup double spaces',
    buildInspectionMessage('منتج', undefined, 1, 'المنتج:  {product}   والرابط:   {link}'),
    'المنتج: منتج والرابط: https://myzill.com/product/1'
  )

  // اختبار الافتراضي عند غياب القالب

  check(
    'buildInspectionMessage: uses DEFAULT_WHATSAPP_MESSAGE when no template provided',
    buildInspectionMessage('منتج اختبار', { length: 50, width: 25 }, 123, undefined).includes('مرحبًا'),
    true
  )

  // اختبار بناء رابط الواتساب

  check(
    'buildWhatsAppUrl: builds correct wa.me URL',
    buildWhatsAppUrl('201001234567', 'مرحبًا'),
    'https://wa.me/201001234567?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7'
  )

  // اختبار أن رسالة الواتساب المعروضة تطابق رابط الواتساب

  const msg = buildInspectionMessage('منتج', undefined, 1, undefined);
  const url = buildWhatsAppUrl('201000000000', msg);
  const decodedUrl = decodeURIComponent(url);
  check(
    'buildInspectionMessage & buildWhatsAppUrl: message in URL matches displayed message',
    msg,
    new URL(url).searchParams.get('text') || ''
  )

  return { passed, failures }
}
