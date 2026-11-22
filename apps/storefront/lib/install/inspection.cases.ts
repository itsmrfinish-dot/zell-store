/**
 * حالات اختبار ميزة المعاينة.
 *
 * التشغيل: pnpm --filter @zell/storefront cases suite inspection
 */

import { buildInspectionMessage, buildWhatsAppUrl } from './inspection'

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

  check(
    'buildInspectionMessage: بدون مقاسات وبدون note',
    buildInspectionMessage('عازل حرارة', undefined, 1),
    'محتاج معاينة قبل التركيب\nالمنتج: عازل حرارة\nالرابط: https://myzill.com/product/1'
  )

  check(
    'buildInspectionMessage: مع مقاسات وبدون note',
    buildInspectionMessage('مصنفر', { length: 100, width: 50 }, 2),
    'محتاج معاينة قبل التركيب\nالمنتج: مصنفر\nالمقاسات: 100×50\nالرابط: https://myzill.com/product/2'
  )

  check(
    'buildInspectionMessage: مع note',
    buildInspectionMessage('عازل حرارة', undefined, 1, 'رسالة المعاينة'),
    'محتاج معاينة قبل التركيب\nرسالة المعاينة\nالمنتج: عازل حرارة\nالرابط: https://myzill.com/product/1'
  )

  check(
    'buildInspectionMessage: مع note ومقاسات',
    buildInspectionMessage('مصنفر', { length: 100, width: 50 }, 2, 'التركيب بيبدأ بمعاينة'),
    'محتاج معاينة قبل التركيب\nالتركيب بيبدأ بمعاينة\nالمنتج: مصنفر\nالمقاسات: 100×50\nالرابط: https://myzill.com/product/2'
  )

  check(
    'buildWhatsAppUrl: بناء الرابط',
    buildWhatsAppUrl('201001234567', 'محتاج معاينة قبل التركيب'),
    'https://wa.me/201001234567?text=%D9%85%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B9%D8%A7%D9%8A%D9%86%D8%A9%20%D9%82%D8%A8%D9%84%20%D8%A7%D9%84%D8%AA%D8%B1%D9%83%D9%8A%D8%A8'
  )

  return { passed, failures }
}
