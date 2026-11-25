import { toStoreSettings } from '../data/mappers'

export type InspectionCaseFailure = { name: string; expected: string; actual: string }

const failures: InspectionCaseFailure[] = []
let passed = 0

function check(name: string, actual: unknown, expected: unknown): void {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) passed += 1
  else failures.push({ name, expected: e, actual: a })
}

function testInspectionEnabledMapping(): void {
  // Test inspection_enabled = true maps to storeIdentity.inspectionEnabled = true
  const rowTrue = {
    id: '1',
    key: 'inspection_enabled',
    value: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
  
  const settingsTrue = toStoreSettings([rowTrue])
  check('inspection_enabled_true', settingsTrue.storeIdentity.inspectionEnabled, true)
  
  // Test inspection_enabled = false maps to storeIdentity.inspectionEnabled = false
  const rowFalse = { ...rowTrue, value: false }
  const settingsFalse = toStoreSettings([rowFalse])
  check('inspection_enabled_false', settingsFalse.storeIdentity.inspectionEnabled, false)
  
  // Test missing inspection_enabled row defaults to true
  const noInspectionRows = [
    { ...rowTrue, key: 'store_name', value: 'test' }
  ]
  const settingsDefault = toStoreSettings(noInspectionRows)
  check('inspection_enabled_missing_defaults_true', settingsDefault.storeIdentity.inspectionEnabled, true)
}

export async function runInspectionCases() {
  testInspectionEnabledMapping()
  
  return {
    name: 'inspection',
    passed,
    failures,
  }
}
