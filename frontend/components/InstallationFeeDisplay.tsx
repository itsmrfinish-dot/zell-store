interface InstallationFeeDisplayProps {
  pricePerSqm: number;
  area?: number;
}

/**
 * Installation Fee Display Component
 * Shows the installation fee per square meter
 * Always uses square meter basis: (length × roll width) × price
 */
export function InstallationFeeDisplay({
  pricePerSqm,
  area = 0,
}: InstallationFeeDisplayProps) {
  const totalFee = area * pricePerSqm;

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        <span>رسوم التركيب الفني: </span>
        <strong className="text-foreground">
          {area.toFixed(2)} م² × {pricePerSqm.toFixed(2)} ج.م/م²
        </strong>
      </div>
      <div className="text-lg font-semibold text-foreground">
        {totalFee.toFixed(2)} ج.م
      </div>
      <div className="text-xs text-muted-foreground">
        الأساس: متر مربع (الطول × عرض الرول)
      </div>
    </div>
  );
}