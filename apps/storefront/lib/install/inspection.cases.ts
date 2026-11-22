/**
 * حالات اختبار ميزة المعاينة.
 *
 * التشغيل: pnpm --filter @zell/storefront cases suite inspection
 */

import { buildInspectionMessage, buildWhatsAppUrl } from './inspection'

export type InspectionCaseFailure = { name: string; expected: string; actual: string }

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
  'buildInspectionMessage: بدون مقاسات',
  buildInspectionMessage('عازل حرارة', undefined, 1),
  'محتاج معاينة قبل التركيب\nالمنتج: عازل حرارة\nالرابط: https://myzill.com/product/1'
)

check(
  'buildInspectionMessage: مع مقاسات',
  buildInspectionMessage('مصنفر', { length: 100, width: 50 }, 2),
  'محتاج معاينة قبل التركيب\nالمنتج: مصنفر\nالمقاسات: 100×50\nالرابط: https://myzill.com/product/2'
)

check(
  'buildWhatsAppUrl: بناء الرابط',
  buildWhatsAppUrl('201001234567', 'محتاج معاينة قبل التركيب'),
  'https://wa.me/201001234567?text=محتاج%20معاينة%20قبل%20التركيب'
)

// الإخراج

if (failures.length === 0) {
  console.log(`✓ جميع الحالات نجحت (${passed})`)
  process.exit(0)
} else {
  console.error(`✗ فشلت ${failures.length} حالة من ${passed + failures.length}`)
  for (const f of failures) {
    console.error(`  ✗ ${f.name}\n    متوقع: ${f.expected}\n    الفعلي: ${f.actual}`)
  }
  process.exit(1)
}
