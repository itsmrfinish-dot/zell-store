// STORAGE-LIST — regression لحذف .abortSignal من storage list() (الـ dry-run كان بيفشل كل الملفات).
// storage-js الـ list() بيرجع Promise عادي مفيهوش .abortSignal؛ استدعاؤها كان بيرمي TypeError على كل ملف.
// الاختبار بيستخدم عميل مزيّف: الـ list بتاعته دالة عادية من غير .abortSignal أصلًا، فلو الكود ناداها كان هيقع.
// الـ fake واعي بالجدول: settings بيرجع صف صالح (value: null) عشان فحص المراجع يعدّي، وباقي الجداول بيرجع count: 0.
import { fileExistsInStorage, processOrphan, type OrphanedImage } from './imageCleanup'

type StorageListCaseReport = { passed: number; failures: { name: string; expected: string; actual: string }[] }

type ListBehavior = { kind: 'data'; names: string[] } | { kind: 'error' } | { kind: 'throw' }

function fakeBuilder(table: string, updates: Record<string, unknown>[]) {
  const b: Record<string, unknown> = {}
  b['select'] = () => b
  b['eq'] = () => b
  b['ilike'] = () => b
  b['or'] = () => b
  b['gt'] = () => b
  b['update'] = (values: Record<string, unknown>) => {
    updates.push(values)
    return b
  }
  b['abortSignal'] = () => b
  b['then'] = (resolve: (value: unknown) => void) => {
    if (table === 'settings') resolve({ data: [{ key: 'test', value: null }], error: null })
    else resolve({ count: 0, data: [{ id: 1 }] })
  }
  return b
}

function fakeSupabase(listBehavior: ListBehavior, updates: Record<string, unknown>[]) {
  return {
    from: (table: string) => fakeBuilder(table, updates),
    storage: {
      from: () => ({
        list: async () => {
          if (listBehavior.kind === 'data') return { data: listBehavior.names.map((name) => ({ name })), error: null }
          if (listBehavior.kind === 'error') return { data: null, error: { message: 'list boom' } }
          throw new Error('list boom')
        },
      }),
    },
  }
}

function orphan(): OrphanedImage {
  return { id: '1', bucket: 'product-images', object_path: 'products/1/a.png', created_at: '2026-11-23T00:00:00.000Z', claimed_at: '2026-11-24T00:00:00.000Z', claimed_by: 'run-1', cleaned_at: null }
}

export async function runStorageListCases(): Promise<StorageListCaseReport> {
  let passed = 0
  const failures: StorageListCaseReport['failures'] = []
  const check = (name: string, expected: string, actual: string) => {
    if (expected === actual) passed += 1
    else failures.push({ name, expected, actual })
  }
  const buildPublicUrl = (bucket: string, objectPath: string) => 'https://example.test/' + bucket + '/' + objectPath

  const updatesA: Record<string, unknown>[] = []
  const supabaseA = fakeSupabase({ kind: 'data', names: ['a.png', 'b.png'] }, updatesA)
  check('list without abortSignal returns exists', 'exists', await fileExistsInStorage(supabaseA, 'product-images', 'products/1/a.png'))
  check('list without abortSignal returns missing', 'missing', await fileExistsInStorage(supabaseA, 'product-images', 'products/1/c.png'))

  const updatesB: Record<string, unknown>[] = []
  const supabaseB = fakeSupabase({ kind: 'error' }, updatesB)
  check('list error returns error', 'error', await fileExistsInStorage(supabaseB, 'product-images', 'products/1/a.png'))
  const updatesC: Record<string, unknown>[] = []
  const supabaseC = fakeSupabase({ kind: 'throw' }, updatesC)
  check('list throw returns error', 'error', await fileExistsInStorage(supabaseC, 'product-images', 'products/1/a.png'))

  const updatesD: Record<string, unknown>[] = []
  const supabaseD = fakeSupabase({ kind: 'throw' }, updatesD)
  const deleteCalls: { bucket: string; objectPath: string }[] = []
  const spyDelete = async (bucket: string, objectPath: string) => {
    deleteCalls.push({ bucket, objectPath })
  }
  const failed = await processOrphan(supabaseD, orphan(), false, 'run-1', buildPublicUrl, spyDelete)
  check('existence failure status is failed', 'failed', failed.status)
  check('existence failure carries publicUrl', 'https://example.test/product-images/products/1/a.png', failed.publicUrl ?? 'undefined')
  check('existence failure never marks cleaned_at', 'false', String(updatesD.some((u) => 'cleaned_at' in u)))
  check('existence failure never calls storageDelete', '0', String(deleteCalls.length))

  const updatesE: Record<string, unknown>[] = []
  const supabaseE = fakeSupabase({ kind: 'data', names: ['a.png'] }, updatesE)
  const deleteCallsE: { bucket: string; objectPath: string }[] = []
  const spyDeleteE = async (bucket: string, objectPath: string) => {
    deleteCallsE.push({ bucket, objectPath })
  }
  const succeeded = await processOrphan(supabaseE, orphan(), false, 'run-1', buildPublicUrl, spyDeleteE)
  check('existing file deletes once via injected delete', '1', String(deleteCallsE.length))
  check('existing file deletion succeeds', 'success', succeeded.status)

  return { passed, failures }
}
