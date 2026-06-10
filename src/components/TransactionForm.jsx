import { X } from 'lucide-react';
import { useState } from 'react';
import { emptyTransaction, PAYMENT_METHODS, TRANSACTION_TYPES } from '../lib/schema';

export default function TransactionForm({ transaction, categories, onSubmit, onClose }) {
  // Aseguramos que siempre haya un método de pago por defecto para evitar campos vacíos
  const [values, setValues] = useState(() => {
    const initial = transaction || emptyTransaction;
    return {
      ...initial,
      paymentMethod: initial.paymentMethod || PAYMENT_METHODS[0]
    };
  });
  const [customCategory, setCustomCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setSaving(true);
      const category = customCategory.trim() || values.category;
      // Reforzamos el envío del paymentMethod
      await onSubmit({ 
        ...values, 
        category, 
        paymentMethod: values.paymentMethod || PAYMENT_METHODS[0] 
      });
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar la transaccion.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-900/40 backdrop-blur-sm p-0 sm:place-items-center sm:p-4">
      {/* Aplicado el efecto Glassmorphism y modo oscuro al formulario */}
      <form onSubmit={submit} className="w-full max-w-xl rounded-t-3xl border border-white/30 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">
              {transaction ? 'Editar transacción' : 'Nueva transacción'}
            </h2>
            <p className="text-sm text-muted dark:text-slate-400">Campos principales para Supabase y Excel</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="grid h-10 w-10 place-items-center rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 text-ink dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-negative/20 bg-negative/10 p-3 text-sm font-medium text-negative dark:text-orange-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monto">
            <input
              required
              min="1"
              step="0.01"
              type="number"
              value={values.amount}
              onChange={(event) => update('amount', event.target.value)}
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-3 py-2.5 text-sm text-ink dark:text-white outline-none focus:border-primary dark:focus:border-teal-500 transition-colors"
            />
          </Field>

          <Field label="Tipo">
            <select 
              value={values.type} 
              onChange={(event) => update('type', event.target.value)} 
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-3 py-2.5 text-sm text-ink dark:text-white outline-none focus:border-primary dark:focus:border-teal-500 transition-colors appearance-none"
            >
              {TRANSACTION_TYPES.map((type) => <option key={type} className="bg-white dark:bg-slate-800">{type}</option>)}
            </select>
          </Field>

          <Field label="Categoría">
            <select 
              value={values.category} 
              onChange={(event) => update('category', event.target.value)} 
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-3 py-2.5 text-sm text-ink dark:text-white outline-none focus:border-primary dark:focus:border-teal-500 transition-colors appearance-none"
            >
              {categories.map((category) => <option key={category} className="bg-white dark:bg-slate-800">{category}</option>)}
            </select>
          </Field>

          <Field label="Nueva categoría">
            <input
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value)}
              placeholder="Opcional"
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-3 py-2.5 text-sm text-ink dark:text-white outline-none focus:border-primary dark:focus:border-teal-500 transition-colors placeholder-muted/60 dark:placeholder-slate-500"
            />
          </Field>

          <Field label="Fecha">
            <input 
              required 
              type="date" 
              value={values.date} 
              onChange={(event) => update('date', event.target.value)} 
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-3 py-2.5 text-sm text-ink dark:text-white outline-none focus:border-primary dark:focus:border-teal-500 transition-colors"
            />
          </Field>

          <Field label="Método de pago">
            <select 
              value={values.paymentMethod} 
              onChange={(event) => update('paymentMethod', event.target.value)} 
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-3 py-2.5 text-sm text-ink dark:text-white outline-none focus:border-primary dark:focus:border-teal-500 transition-colors appearance-none"
            >
              {PAYMENT_METHODS.map((method) => <option key={method} className="bg-white dark:bg-slate-800">{method}</option>)}
            </select>
          </Field>

          <Field label="Descripción" wide>
            <textarea
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-3 py-2.5 text-sm text-ink dark:text-white outline-none focus:border-primary dark:focus:border-teal-500 transition-colors resize-none"
            />
          </Field>
        </div>

        <button 
          disabled={saving} 
          className="mt-6 h-12 w-full rounded-2xl bg-teal-600 hover:bg-teal-500 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 disabled:opacity-60 transition-all"
        >
          {saving ? 'Guardando...' : 'Guardar transacción'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children, wide }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}