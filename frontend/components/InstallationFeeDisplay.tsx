import { formatPiastres, installationAreaSquareMeters, installationFeeForAreaPiastres, type InstallationDimension } from '../../packages/core/src'

type InstallationFeeDisplayProps = {
  dimensions: readonly InstallationDimension[]
  feePerSquareMeterPiastres: number
}

export function InstallationFeeDisplay({
  dimensions,
  feePerSquareMeterPiastres,
}: InstallationFeeDisplayProps) {
  const areaSquareMeters = installationAreaSquareMeters(dimensions)
  if (!Number.isFinite(feePerSquareMeterPiastres) || feePerSquareMeterPiastres < 0 || areaSquareMeters <= 0) {
    return null
  }

  const feePiastres = installationFeeForAreaPiastres(feePerSquareMeterPiastres, areaSquareMeters)

  return (
    <div aria-live="polite" className="rounded-lg border border-border bg-card p-3 text-sm text-fg">
      <p>Installation area: {areaSquareMeters.toFixed(2)} {'m\u00B2'}</p>
      <p>Installation fee: {formatPiastres(feePiastres)}</p>
    </div>
  )
}
