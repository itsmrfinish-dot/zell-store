export type InstallationFeeCalculation = {
  lengthMeters: number
  rollWidthMeters: number
  areaSquareMeters: number
  fee: number
}

/** Converts the selected centimeter dimensions to meters and calculates fee from LENGTH ONLY (linear pricing, rate per meter). */
export function calculateInstallationFee(
  lengthCm: number,
  rollWidthCm: number,
  feePerMeter: number,
): InstallationFeeCalculation {
  if (!Number.isFinite(lengthCm) || lengthCm <= 0) {
    throw new RangeError('lengthCm must be a positive finite number')
  }
  if (!Number.isFinite(rollWidthCm) || rollWidthCm <= 0) {
    throw new RangeError('rollWidthCm must be a positive finite number')
  }
  if (!Number.isFinite(feePerMeter) || feePerMeter < 0) {
    throw new RangeError('feePerMeter must be a non-negative finite number')
  }

  const lengthMeters = lengthCm / 100
  const rollWidthMeters = rollWidthCm / 100
  const areaSquareMeters = lengthMeters * rollWidthMeters
  const fee = Math.round(lengthMeters * feePerMeter)

  return { lengthMeters, rollWidthMeters, areaSquareMeters, fee }
}
