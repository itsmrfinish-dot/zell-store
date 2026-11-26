import { useState } from 'react';
import { InstallationFeeDisplay } from './InstallationFeeDisplay';

interface ProductBuyProps {
  productId: number;
  productName: string;
  basePricePerSqm: number;
  installationFeePerSqm?: number;
  defaultLengthCm?: number;
  defaultRollWidthCm?: number;
}

/**
 * ProductBuy Component
 * Manages product purchase with installation fee calculation
 * Accepts and passes dimensions in CENTIMETERS
 */
export function ProductBuy({
  productId,
  productName,
  basePricePerSqm,
  installationFeePerSqm = 50,
  defaultLengthCm = 300,
  defaultRollWidthCm = 50,
}: ProductBuyProps) {
  const [lengthCm, setLengthCm] = useState<number>(defaultLengthCm);
  const [rollWidthCm, setRollWidthCm] = useState<number>(defaultRollWidthCm);
  const [quantity, setQuantity] = useState<number>(1);

  // Calculate base product fee (Lines 95, 125 as requested)
  const lengthM = lengthCm / 100;
  const rollWidthM = rollWidthCm / 100;
  const areaSqm = lengthM * rollWidthM;
  const productFee = areaSqm * basePricePerSqm;
  const totalProductFee = productFee * quantity;

  return (
    <div className="space-y-6 p-6 bg-background border border-border rounded-lg">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {productName}
        </h2>
        <p className="text-sm text-muted-foreground">Product ID: {productId}</p>
      </div>

      <div className="space-y-4 bg-secondary/50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Length (cm)
          </label>
          <input
            type="number"
            value={lengthCm}
            onChange={(e) => setLengthCm(Number(e.target.value))}
            min="0"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            placeholder="Enter length in centimeters"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {(lengthCm / 100).toFixed(2)}m
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Roll Width (cm)
          </label>
          <input
            type="number"
            value={rollWidthCm}
            onChange={(e) => setRollWidthCm(Number(e.target.value))}
            min="0"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            placeholder="Enter roll width in centimeters"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {(rollWidthCm / 100).toFixed(2)}m
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            placeholder="Enter quantity"
          />
        </div>
      </div>

      <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <div className="text-sm">
          <span className="text-muted-foreground">Base product fee: </span>
          <span className="font-semibold text-foreground">
            {totalProductFee.toFixed(2)} EGP
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          ({areaSqm.toFixed(4)} sqm × {basePricePerSqm.toFixed(2)} EGP/sqm × {quantity})
        </div>
      </div>

      <InstallationFeeDisplay
        lengthCm={lengthCm}
        rollWidthCm={rollWidthCm}
        pricePerSqm={installationFeePerSqm}
        showDetails={true}
      />

      <div className="space-y-2 p-4 bg-accent/10 rounded-lg border border-accent">
        <div className="text-sm font-semibold text-foreground">
          Total Order: {(totalProductFee + areaSqm * installationFeePerSqm).toFixed(2)} EGP
        </div>
      </div>

      <button className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
        Add to Cart
      </button>
    </div>
  );
}