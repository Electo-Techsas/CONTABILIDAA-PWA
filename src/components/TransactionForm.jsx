import { X } from 'lucide-react';
import { useState } from 'react';
import { emptyTransaction, PAYMENT_METHODS, TRANSACTION_TYPES } from '../lib/schema';

export default function TransactionForm({ transaction, categories, onSubmit, onClose }) {
  const [values, setValues] = useState(transaction || emptyTransaction);
  const [customCategory, setCustomCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const category = customCategory.trim() || values.category;
    await onSubmit({ ...values, category });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/35 p-0 sm:place-items-center sm:p-4">
      <form onSubmit={submit} className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-soft sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">{transaction ? 'Editar transaccion' : 'Nueva transaccion'}</h2>
            <p className="text-sm text-muted">Campos principales para Supabase y Excel</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-black/5">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monto">
            <input
              required
              min="1"
              step="0.01"
              type="number"
              value={values.amount}
              onChange={(event) => update('amount', event.target.value)}
              className="input"
            />
          </Field>

          <Field label="Tipo">
            <select value={values.type} onChange={(event) => update('type', event.target.value)} className="input">
              {TRANSACTION_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </Field>

          <Field label="Categoria">
            <select value={values.category} onChange={(event) => update('category', event.target.value)} className="input">
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </Field>

          <Field label="Nueva categoria">
            <input
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value)}
              placeholder="Opcional"
              className="input"
            />
          </Field>

          <Field label="Fecha">
            <input required type="date" value={values.date} onChange={(event) => update('date', event.target.value)} className="input" />
          </Field>

          <Field label="Metodo de pago">
            <select value={values.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)} className="input">
              {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
            </select>
          </Field>

          <Field label="Descripcion" wide>
            <textarea
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
              rows={3}
              className="input resize-none"
            />
          </Field>
        </div>

        <button disabled={saving} className="mt-5 h-12 w-full rounded-full bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? 'Guardando...' : 'Guardar transaccion'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children, wide }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
