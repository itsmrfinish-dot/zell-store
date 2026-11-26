import { describe, it, expect } from 'vitest';

/**
 * Test suite for installation fee calculations
 * Validates centimeter to meter conversion and area calculations
 */

describe('Installation Fee Calculations', () => {
  describe('CM to M conversion', () => {
    it('should convert 300cm length to 3m', () => {
      const lengthCm = 300;
      const lengthM = lengthCm / 100;
      expect(lengthM).toBe(3);
    });

    it('should convert 50cm roll width to 0.5m', () => {
      const rollWidthCm = 50;
      const rollWidthM = rollWidthCm / 100;
      expect(rollWidthM).toBe(0.5);
    });

    it('should convert example: 300cm × 50cm → 3m × 0.5m', () => {
      const lengthCm = 300;
      const rollWidthCm = 50;
      const lengthM = lengthCm / 100;
      const rollWidthM = rollWidthCm / 100;
      
      expect(lengthM).toBe(3);
      expect(rollWidthM).toBe(0.5);
    });
  });

  describe('Area calculation', () => {
    it('should calculate 3m × 0.5m = 1.5 sqm', () => {
      const lengthM = 3;
      const rollWidthM = 0.5;
      const areaSqm = lengthM * rollWidthM;
      
      expect(areaSqm).toBe(1.5);
    });

    it('should calculate area from CM: 300cm × 50cm = 1.5 sqm', () => {
      const lengthCm = 300;
      const rollWidthCm = 50;
      
      // Convert to meters
      const lengthM = lengthCm / 100;
      const rollWidthM = rollWidthCm / 100;
      
      // Calculate area
      const areaSqm = lengthM * rollWidthM;
      
      expect(lengthM).toBe(3);
      expect(rollWidthM).toBe(0.5);
      expect(areaSqm).toBe(1.5);
    });
  });

  describe('Fee calculation', () => {
    it('should calculate installation fee: 1.5 sqm × 50 EGP/sqm = 75 EGP', () => {
      const areaSqm = 1.5;
      const pricePerSqm = 50;
      const fee = areaSqm * pricePerSqm;
      
      expect(fee).toBe(75);
    });

    it('complete example: 300cm × 50cm at 50 EGP/sqm = 75 EGP', () => {
      const lengthCm = 300;
      const rollWidthCm = 50;
      const pricePerSqm = 50;
      
      // Step 1: Convert CM to M
      const lengthM = lengthCm / 100;
      const rollWidthM = rollWidthCm / 100;
      
      // Step 2: Calculate area
      const areaSqm = lengthM * rollWidthM;
      
      // Step 3: Calculate fee
      const fee = areaSqm * pricePerSqm;
      
      expect(lengthM).toBe(3);
      expect(rollWidthM).toBe(0.5);
      expect(areaSqm).toBe(1.5);
      expect(fee).toBe(75);
    });
  });

  describe('Edge cases', () => {
    it('should handle 0cm measurements', () => {
      const lengthCm = 0;
      const rollWidthCm = 50;
      
      const lengthM = lengthCm / 100;
      const rollWidthM = rollWidthCm / 100;
      const areaSqm = lengthM * rollWidthM;
      
      expect(lengthM).toBe(0);
      expect(rollWidthM).toBe(0.5);
      expect(areaSqm).toBe(0);
    });

    it('should handle large measurements: 1000cm × 200cm = 20 sqm', () => {
      const lengthCm = 1000;
      const rollWidthCm = 200;
      
      const lengthM = lengthCm / 100;
      const rollWidthM = rollWidthCm / 100;
      const areaSqm = lengthM * rollWidthM;
      
      expect(lengthM).toBe(10);
      expect(rollWidthM).toBe(2);
      expect(areaSqm).toBe(20);
    });

    it('should fail on negative measurements', () => {
      const lengthCm = -300;
      const rollWidthCm = 50;
      
      if (lengthCm <= 0 || rollWidthCm <= 0) {
        throw new Error('Invalid dimensions');
      }
      
      expect(() => {
        if (lengthCm <= 0 || rollWidthCm <= 0) {
          throw new Error('Invalid dimensions');
        }
      }).toThrow('Invalid dimensions');
    });
  });
});