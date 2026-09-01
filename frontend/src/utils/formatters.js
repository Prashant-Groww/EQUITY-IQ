/**
 * Formats a numeric value into Indian Rupee (INR ₹) currency notation.
 * Uses Indian numbering system format (e.g., ₹2,50,000).
 */
export const formatINR = (val, decimals = 2) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  const num = Number(val);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

/**
 * Formats large market capitalization values into Indian denomination.
 * Handles both values stored directly in Crores (e.g. 935000 -> ₹9.35 Lakh Cr)
 * and raw INR values (e.g. 9.35e12 -> ₹9.35 Lakh Cr).
 */
export const formatMarketCap = (val) => {
  if (val === null || val === undefined || isNaN(val) || val === '') return 'Data unavailable';
  const num = Number(val);
  if (num === 0) return '₹0 Cr';

  // If passed as raw INR currency (> 1 Lakh Crore in INR = 1e12)
  if (num >= 1e12) {
    const lakhCrores = num / 1e12;
    return `₹${lakhCrores.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} Lakh Cr`;
  }
  if (num >= 1e7) {
    const crores = num / 1e7;
    return `₹${crores.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} Cr`;
  }

  // If stored directly in Crores (Indian Stocks standard: >= 100,000 Cr is denoted as Lakh Cr)
  if (num >= 100000) {
    const lakhCrores = num / 100000;
    return `₹${lakhCrores.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} Lakh Cr`;
  }
  if (num >= 1) {
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} Cr`;
  }

  return `₹${num.toFixed(2)} Cr`;
};

/**
 * Formats trade volume (share count) without currency symbols.
 * 1 Crore = 10,000,000 shares
 * 1 Lakh  = 100,000 shares
 */
export const formatVolume = (val) => {
  if (val === null || val === undefined || isNaN(val) || val === '') return 'Data unavailable';
  const num = Number(val);
  const absNum = Math.abs(num);

  if (absNum >= 1e7) {
    const crores = num / 1e7;
    return `${crores.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} Cr`;
  }
  if (absNum >= 1e5) {
    const lakhs = num / 1e5;
    return `${lakhs.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} L`;
  }
  if (absNum >= 1e3) {
    const thousands = num / 1e3;
    return `${thousands.toLocaleString('en-IN', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} K`;
  }
  return num.toLocaleString('en-IN');
};

/**
 * Formats large financial figures (Revenue, Cash Flow) in Crores (Cr) or Lakhs (L).
 */
export const formatIndianNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Number(val);
  const absNum = Math.abs(num);

  if (absNum >= 1e7) {
    const crores = num / 1e7;
    return `₹${crores.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} Cr`;
  }
  if (absNum >= 1e5) {
    const lakhs = num / 1e5;
    return `₹${lakhs.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} L`;
  }
  return formatINR(num, 2);
};
