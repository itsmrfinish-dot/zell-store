import { describe, it, expect } from 'vitest'
import { calculateInstallationFee } from '../backend/installation/calculateInstallationFee'

describe('Installation Fee Calculations', () => {
  describe('CM to M conversion and fee calculation', () => {
    it('should convert 300cm × 50cm to 1.5 sqm with fee 150', () => {
      const result = calculateInstallationFee(300, 50, 100)
      
      expect(result.lengthMeters).toBe(3)
      expect(result.rollWidthMeters).toBe(0.5)
      expect(result.areaSquareMeters).toBe(1.5)
      expect(result.fee).toBe(150)
    })

    it('should convert 500cm × 70cm to 3.5 sqm with fee 350', () => {
      const result = calculateInstallationFee(500, 70, 100)
      
      expect(result.lengthMeters).toBe(5)
      expect(result.rollWidthMeters).toBe(0.7)
      expect(result.areaSquareMeters).toBe(3.5)
      expect(result.fee).toBe(350)
    })
  })
})
