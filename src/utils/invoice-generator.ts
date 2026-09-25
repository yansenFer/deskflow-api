import crypto from 'crypto';

/**
 * Generate a unique POS invoice number
 * Format: INV-YYYYMMDD-[4 RANDOM ALPHANUMERIC]
 * Example: INV-20260923-A8F2
 */
export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `INV-${dateStr}-${randomSuffix}`;
};
