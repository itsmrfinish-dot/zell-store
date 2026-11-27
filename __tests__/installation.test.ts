import { describe, it, expect } from 'vitest'
import { calculateInstallationFee } from '../backend/installation/calculateInstallationFee'

describe('Installation Fee Calculations', () => {
  describe('CM to M conversion and fee calculation (LINEAR: fee from length only)', () => {
    it('should convert 300cm × 50cm: lengthMeters=3, areaSquareMeters=1.5, but fee=300 (from length × rate)', () => {
      const result = calculateInstallationFee(300, 50, 100)

      expect(result.lengthMeters).toBe(3)
      expect(result.rollWidthMeters).toBe(0.5)
      expect(result.areaSquareMeters).toBe(1.5)
      expect(result.fee).toBe(300) // 3 meters × 100 per meter = 300, NOT area-based
    })

    it('should convert 500cm × 70cm: lengthMeters=5, areaSquareMeters=3.5, but fee=500 (from length × rate)', () => {
      const result = calculateInstallationFee(500, 70, 100)

      expect(result.lengthMeters).toBe(5)
      expect(result.rollWidthMeters).toBe(0.7)
      expect(result.areaSquareMeters).toBe(3.5)
      expect(result.fee).toBe(500) // 5 meters × 100 per meter = 500, NOT area-based
    })
  })
})
