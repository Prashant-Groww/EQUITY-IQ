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
 * Formats large financial figures (Market Cap, Revenue) in Crores (Cr) or Lakhs (L).
 * 1 Crore = 10,000,000 (10^7)
 * 1 Lakh  = 100,000 (10^5)
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
