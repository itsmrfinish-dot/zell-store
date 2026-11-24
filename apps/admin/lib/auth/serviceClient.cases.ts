/**
 * SERVICE-CLIENT — إنشاء عميل الخدمة من غير كوكيز.
 *
 * عميل service_role مبيحتاجش جلسة مستخدم ولا كوكيز: إنشاؤه لازم ينجح
 * من غير أي cookie store. ده اختبار regression للغلطة اللي وقّعت
 * الـ dry-run: createServiceClient كان بيستخدم createServerClient
 * من @supabase/ssr من غير خيار cookies، والمكتبة بترمي وقت الإنشاء.
 * بعد الإصلاح بيستخدم createClient من @supabase/supabase-js.
 */

import { createServiceClient } from './supabaseServer'

export type ServiceClientCaseFailure = { name: string; expected: string; actual: string }
export type ServiceClientCaseReport = { passed: number; failures: ServiceClientCaseFailure[] }

const URL = 'https://zellcases.supabase.co'
const KEY = 'service-role-key-for-cases'

export async function runServiceClientCases(): Promise<ServiceClientCaseReport> {
  let passed = 0
  const failures: ServiceClientCaseFailure[] = []
  const check = (name: string, expected: string, actual: string) => {
    if (expected === actual) passed += 1
    else failures.push({ name, expected, actual })
  }
  const env = process.env
  const savedUrl = env['SUPABASE_URL']
  const savedKey = env['SUPABASE_SERVICE_ROLE_KEY']
  const restore = (name: string, value: string | undefined) => {
    if (value === undefined) delete env[name]
    else env[name] = value
  }
  try {
    env['SUPABASE_URL'] = URL
    env['SUPABASE_SERVICE_ROLE_KEY'] = KEY
    let client: Awaited<ReturnType<typeof createServiceClient>> | null = null
    let thrown: string | null = null
    try {
      client = await createServiceClient()
    } catch (err) {
      thrown = err instanceof Error ? err.message : String(err)
    }
    check('service client constructs without cookies', 'null', String(thrown))
    check('service client exposes query builder', 'function', typeof client?.from)
    delete env['SUPABASE_URL']
    let missingUrl: string | null = null
    try {
      await createServiceClient()
    } catch (err) {
      missingUrl = err instanceof Error ? err.message : String(err)
    }
    check('missing SUPABASE_URL still throws', 'SUPABASE_URL not configured', missingUrl ?? 'no-throw')
    env['SUPABASE_URL'] = URL
    delete env['SUPABASE_SERVICE_ROLE_KEY']
    let missingKey: string | null = null
    try {
      await createServiceClient()
    } catch (err) {
      missingKey = err instanceof Error ? err.message : String(err)
    }
    check('missing SUPABASE_SERVICE_ROLE_KEY still throws', 'SUPABASE_SERVICE_ROLE_KEY not configured', missingKey ?? 'no-throw')
  } finally {
    restore('SUPABASE_URL', savedUrl)
    restore('SUPABASE_SERVICE_ROLE_KEY', savedKey)
  }
  return { passed, failures }
}
