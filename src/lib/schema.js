export const TRANSACTION_TYPES = ['Ingreso', 'Egreso'];

export const DEFAULT_CATEGORIES = [
  'Ventas',
  'Servicios',
  'Nomina',
  'Alquiler',
  'Impuestos',
  'Compras',
  'Transporte',
  'Marketing',
  'Otros'
];

export const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta',
  'Transferencia',
  'Nequi',
  'Daviplata',
  'Credito',
  'Otro'
];

export const emptyTransaction = {
  amount: '',
  type: 'Egreso',
  category: 'Otros',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  paymentMethod: 'Efectivo'
};

export function transactionTableName() {
  return 'transactions';
}

export function transactionDatabaseShape() {
  return {
    id: 'uuid',
    user_id: 'uuid auth.users(id)',
    amount: 'number',
    type: 'Ingreso | Egreso',
    category: 'string',
    date: 'date YYYY-MM-DD',
    description: 'string',
    payment_method: 'string',
    import_hash: 'string opcional para evitar duplicados',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  };
}
