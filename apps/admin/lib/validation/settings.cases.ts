import type { StoreIdentity } from '../../../packages/core/src'
import { saveIdentity } from './saveIdentity'

/**
 * INSPECTION-TOGGLE tests: verify inspection_enabled setting can be toggled
 * via saveIdentity and is properly persisted and retrieved.
 */

type TestCase = {
  name: string
  identity: Partial<StoreIdentity> & { storeName: string; offerText: string; whatsappNumber: string; whatsappMessage: string }
  expectedVersion: number | null
  expectedInspectionEnabled: boolean | null
}

const cases: TestCase[] = [
  {
    name: 'save with inspection ON (default)',
    identity: {
      storeName: 'Test Store ON',
      offerText: 'Test offer',
      whatsappNumber: '201000000000',
      whatsappMessage: 'Test message',
      inspectionEnabled: true,
    },
    expectedVersion: 1, // should succeed
    expectedInspectionEnabled: true,
  },
  {
    name: 'save with inspection OFF',
    identity: {
      storeName: 'Test Store OFF',
      offerText: 'Test offer',
      whatsappNumber: '201000000000',
      whatsappMessage: 'Test message',
      inspectionEnabled: false,
    },
    expectedVersion: 1, // should succeed after ON
    expectedInspectionEnabled: false,
  },
  {
    name: 'toggle back to ON',
    identity: {
      storeName: 'Test Store ON again',
      offerText: 'Test offer',
      whatsappNumber: '201000000000',
      whatsappMessage: 'Test message',
      inspectionEnabled: true,
    },
    expectedVersion: 1, // should succeed after OFF
    expectedInspectionEnabled: true,
  },
]

export async function runSettingsCases(db: any): Promise<{ pass: number; fail: number; errors: string[] }> {
  const errors: string[] = []
  let pass = 0
  let fail = 0

  let currentVersion: string | null = null

  for (const testCase of cases) {
    try {
      // Call saveIdentity with the test identity
      const result = await saveIdentity(
        currentVersion, // p_expected_updated_at (null for first call)
        testCase.identity
      )

      if (result === null && testCase.expectedVersion === null) {
        // Expected conflict
        pass++
      } else if (result !== null && testCase.expectedVersion !== null) {
        // Should have succeeded
        currentVersion = result
        pass++
      } else {
        fail++
        errors.push(`${testCase.name}: unexpected result type (got ${result === null ? 'null' : 'version'}, expected ${testCase.expectedVersion === null ? 'conflict' : 'success'})`)
      }

      // Verify the setting was persisted by reading it back
      const checkResult = await db.query(
        'SELECT value FROM settings WHERE key = \'inspection_enabled\''
      )
      const inspectionEnabledValue = checkResult.rows.length > 0
        ? checkResult.rows[0].value === 'true'
        : true // default if not found

      if (inspectionEnabledValue !== testCase.expectedInspectionEnabled) {
        fail++
        errors.push(`${testCase.name}: inspection_enabled mismatch (got ${inspectionEnabledValue}, expected ${testCase.expectedInspectionEnabled})`)
      }
    } catch (error) {
      fail++
      errors.push(`${testCase.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return { pass, fail, errors }
}
