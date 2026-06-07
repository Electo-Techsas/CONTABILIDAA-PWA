import * as XLSX from 'xlsx';

const REQUIRED_COLUMNS = ['Monto', 'Tipo', 'Categoria', 'Fecha', 'Descripcion'];

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toExcelDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return '';
    return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
  }
  const raw = String(value ?? '').trim();
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : date.toISOString().slice(0, 10);
}

export function buildImportHash(transaction) {
  return [
    Number(transaction.amount).toFixed(2),
    transaction.type,
    transaction.category,
    transaction.date,
    transaction.description.trim().toLowerCase(),
    transaction.paymentMethod
  ].join('|');
}

export async function readTransactionsFromExcel(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rows.length) {
    return { transactions: [], errors: ['El archivo esta vacio.'] };
  }

  const firstRow = rows[0];
  const headerMap = Object.keys(firstRow).reduce((acc, key) => {
    acc[normalizeHeader(key)] = key;
    return acc;
  }, {});

  const missing = REQUIRED_COLUMNS.filter((column) => !headerMap[column]);
  if (missing.length) {
    return { transactions: [], errors: [`Faltan columnas requeridas: ${missing.join(', ')}`] };
  }

  const errors = [];
  const transactions = rows.map((row, index) => {
    const amount = Number(row[headerMap.Monto]);
    const type = String(row[headerMap.Tipo]).trim();
    const category = String(row[headerMap.Categoria]).trim();
    const date = toExcelDate(row[headerMap.Fecha]);
    const description = String(row[headerMap.Descripcion]).trim();
    const paymentMethod = String(row[headerMap['Metodo de pago']] ?? row[headerMap.Metodo] ?? 'Otro').trim() || 'Otro';

    if (!Number.isFinite(amount) || amount <= 0) errors.push(`Fila ${index + 2}: monto invalido.`);
    if (!['Ingreso', 'Egreso'].includes(type)) errors.push(`Fila ${index + 2}: tipo debe ser Ingreso o Egreso.`);
    if (!category) errors.push(`Fila ${index + 2}: categoria requerida.`);
    if (!date) errors.push(`Fila ${index + 2}: fecha requerida.`);

    const transaction = { amount, type, category, date, description, paymentMethod };
    return { ...transaction, importHash: buildImportHash(transaction) };
  });

  return { transactions: errors.length ? [] : transactions, errors };
}

export function exportTransactionsToExcel(transactions) {
  const rows = transactions.map((item) => ({
    Monto: item.amount,
    Tipo: item.type,
    Categoria: item.category,
    Fecha: item.date,
    Descripcion: item.description,
    'Metodo de pago': item.paymentMethod
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 38 },
    { wch: 18 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones');
  XLSX.writeFile(workbook, `transacciones-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
