/**
 * Calculate installation fees based on selected basis (linear or square meters)
 * 
 * params:
 * {
 *   productIds: number[],
 *   lengths: number[],
 *   rollWidths?: number[],
 *   basis: 'linear' | 'square',
 *   pricePerUnit: number
 * }
 */

interface InstallationFeeRequest {
  productIds: number[];
  lengths: number[];
  rollWidths?: number[];
  basis: 'linear' | 'square';
  pricePerUnit: number;
}

export default async function calculateInstallationFee(req: {
  params: InstallationFeeRequest;
}): Promise<{
  totalFee: number;
  basis: string;
  details: Array<{
    productId: number;
    length: number;
    area?: number;
    fee: number;
  }>;
}> {
  const { productIds, lengths, rollWidths = [], basis, pricePerUnit } = req.params;

  if (!productIds || productIds.length === 0) {
    throw new Error('productIds array cannot be empty');
  }

  if (lengths.length !== productIds.length) {
    throw new Error('lengths array must match productIds length');
  }

  if (basis !== 'linear' && basis !== 'square') {
    throw new Error(`Invalid basis: ${basis}. Must be 'linear' or 'square'`);
  }

  if (pricePerUnit <= 0) {
    throw new Error('pricePerUnit must be greater than 0');
  }

  const details: Array<{
    productId: number;
    length: number;
    area?: number;
    fee: number;
  }> = [];

  let totalFee = 0;

  for (let i = 0; i < productIds.length; i++) {
    const length = lengths[i];
    const rollWidth = basis === 'square' ? rollWidths[i] : undefined;

    let fee = 0;

    if (basis === 'linear') {
      // Linear meter basis: length × price per linear meter
      fee = length * pricePerUnit;
      details.push({
        productId: productIds[i],
        length,
        fee: Math.round(fee * 100) / 100,
      });
    } else {
      // Square meter basis: (length × width) × price per square meter
      if (rollWidth === undefined || rollWidth <= 0) {
        throw new Error(
          `Invalid roll width for product ${productIds[i]}: ${rollWidth}`
        );
      }
      const area = length * rollWidth;
      fee = area * pricePerUnit;
      details.push({
        productId: productIds[i],
        length,
        area: Math.round(area * 100) / 100,
        fee: Math.round(fee * 100) / 100,
      });
    }

    totalFee += fee;
  }

  return {
    totalFee: Math.round(totalFee * 100) / 100,
    basis,
    details,
  };
}