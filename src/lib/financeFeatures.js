import { PAYMENT_METHODS } from './schema';
import { addAmounts, normalizeAmount } from './currency';

export const TRANSFER_TYPE = 'Transferencia';
export const ADJUSTMENT_TYPE = 'Ajuste';

export function isRealIncome(item) {
  return item.type === 'Ingreso';
}

export function isRealExpense(item) {
  return item.type === 'Egreso';
}

export function createTransferDescription(targetMethod, note = '') {
  const suffix = note.trim() ? ` - ${note.trim()}` : '';
  return `[Destino:${targetMethod}]${suffix}`;
}

export function createAdjustmentDescription(direction, note = '') {
  const suffix = note.trim() ? ` - ${note.trim()}` : '';
  return `[Ajuste:${direction}]${suffix}`;
}

export function parseTransferTarget(description = '') {
  return description.match(/\[Destino:([^\]]+)\]/)?.[1] || '';
}

export function parseAdjustmentDirection(description = '') {
  return description.match(/\[Ajuste:([^\]]+)\]/)?.[1] || 'positivo';
}

export function cleanFinanceDescription(description = '') {
  return description.replace(/\[(Destino|Ajuste):[^\]]+\]\s*-?\s*/g, '').trim();
}

export function buildAccountBalances(transactions, currency, paymentMethods = PAYMENT_METHODS) {
  const balances = new Map(paymentMethods.map((method) => [method, 0]));

  transactions.forEach((item) => {
    const method = item.paymentMethod || 'Efectivo';
    const amount = normalizeAmount(item.amount, currency);

    if (!balances.has(method)) balances.set(method, 0);

    if (item.type === 'Ingreso') {
      balances.set(method, addAmounts([balances.get(method), amount], currency));
    } else if (item.type === 'Egreso') {
      balances.set(method, addAmounts([balances.get(method), -amount], currency));
    } else if (item.type === TRANSFER_TYPE) {
      const target = parseTransferTarget(item.description);
      balances.set(method, addAmounts([balances.get(method), -amount], currency));
      if (target) {
        if (!balances.has(target)) balances.set(target, 0);
        balances.set(target, addAmounts([balances.get(target), amount], currency));
      }
    } else if (item.type === ADJUSTMENT_TYPE) {
      const direction = parseAdjustmentDirection(item.description);
      balances.set(method, addAmounts([balances.get(method), direction === 'negativo' ? -amount : amount], currency));
    }
  });

  return Array.from(balances.entries()).map(([method, balance]) => ({ method, balance }));
}

export function sumAccountBalances(transactions, currency, paymentMethods) {
  return addAmounts(buildAccountBalances(transactions, currency, paymentMethods).map((item) => item.balance), currency);
}

export function getMonthRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const from = new Date(year, month, 1).toISOString().slice(0, 10);
  const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

export function getPreviousMonthRange(date = new Date()) {
  const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getMonthRange(previous);
}

export function getLastDaysRange(days, date = new Date()) {
  const to = date.toISOString().slice(0, 10);
  const fromDate = new Date(date);
  fromDate.setDate(fromDate.getDate() - (days - 1));
  return { from: fromDate.toISOString().slice(0, 10), to };
}
