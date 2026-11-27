import { formatPiastres } from '../packages/core/src/pricing'
type InstallationFeeDisplayProps = {
  lengthCm: number
  rollWidthCm: number
  feePerSquareMeterPiastres: number
}

export function InstallationFeeDisplay({
  lengthCm,
  rollWidthCm,
  feePerSquareMeterPiastres,
}: InstallationFeeDisplayProps) {
  if (
    !Number.isFinite(lengthCm) ||
    lengthCm <= 0 ||
    !Number.isFinite(rollWidthCm) ||
    rollWidthCm <= 0 ||
    !Number.isFinite(feePerSquareMeterPiastres) ||
    feePerSquareMeterPiastres < 0
  ) {
    return null
  }

  const lengthMeters = lengthCm / 100
  const rollWidthMeters = rollWidthCm / 100
  const areaSquareMeters = lengthMeters * rollWidthMeters
  const feePiastres = Math.round(areaSquareMeters * feePerSquareMeterPiastres)

  return (
    <div aria-live="polite" className="rounded-lg border border-border bg-card p-3 text-sm text-fg">
      <p>Installation area: {areaSquareMeters.toFixed(2)} mÂ²</p>
      <p>Installation fee: {formatPiastres(feePiastres).replace(" ج.م", "")('en-US')}</p>
    </div>
  )
}
