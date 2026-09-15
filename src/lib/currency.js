export const SUPPORTED_CURRENCIES = {
  COP: { code: 'COP', label: 'Pesos colombianos (COP)', locale: 'es-CO', fractionDigits: 0, minorUnit: 'pesos' },
  USD: { code: 'USD', label: 'Dólares estadounidenses (USD)', locale: 'en-US', fractionDigits: 2, minorUnit: 'centavos' },
  EUR: { code: 'EUR', label: 'Euros (EUR)', locale: 'es-ES', fractionDigits: 2, minorUnit: 'céntimos' }
};

export const DEFAULT_CURRENCY = 'COP';

export function getCurrency(code) {
  return SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
}

export function getCurrencyStep(code) {
  return getCurrency(code).fractionDigits ? '0.01' : '1';
}

export function formatMoney(value, code = DEFAULT_CURRENCY) {
  const currency = getCurrency(code);
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.fractionDigits,
    maximumFractionDigits: currency.fractionDigits
  }).format(Number(value) || 0);
}

export function normalizeAmount(value, code = DEFAULT_CURRENCY) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  const factor = 10 ** getCurrency(code).fractionDigits;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

export function addAmounts(values, code = DEFAULT_CURRENCY) {
  const factor = 10 ** getCurrency(code).fractionDigits;
  return values.reduce((total, value) => total + Math.round((Number(value) || 0) * factor), 0) / factor;
}
