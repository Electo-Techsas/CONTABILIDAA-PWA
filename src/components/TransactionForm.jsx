import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { emptyTransaction, PAYMENT_METHODS, TRANSACTION_TYPES } from '../lib/schema';

export default function TransactionForm({ transaction, categories, onSubmit, onClose }) {
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
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-end bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4 lg:left-72">
      <form
        onSubmit={submit}
        className="liquid-panel mb-[calc(5.75rem+env(safe-area-inset-bottom))] flex max-h-[calc(100dvh-6.5rem-env(safe-area-inset-bottom))] w-full max-w-xl flex-col rounded-[28px] shadow-2xl sm:mb-0 sm:max-h-[calc(100dvh-2rem)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/20 px-5 py-4 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ink dark:text-white">
              {transaction ? 'Editar transaccion' : 'Nueva transaccion'}
            </h2>
            <p className="text-sm text-muted dark:text-slate-400">Campos principales para Supabase y Excel</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-button grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-ink dark:text-white"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
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
                className="input"
              />
            </Field>

            <Field label="Tipo">
              <select
                value={values.type}
                onChange={(event) => update('type', event.target.value)}
                className="input appearance-none"
              >
                {TRANSACTION_TYPES.map((type) => <option key={type} className="bg-white dark:bg-slate-800">{type}</option>)}
              </select>
            </Field>

            <Field label="Categoria">
              <select
                value={values.category}
                onChange={(event) => update('category', event.target.value)}
                className="input appearance-none"
              >
                {categories.map((category) => <option key={category} className="bg-white dark:bg-slate-800">{category}</option>)}
              </select>
            </Field>

            <Field label="Nueva categoria">
              <input
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Opcional"
                className="input placeholder-muted/60 dark:placeholder-slate-500"
              />
            </Field>

            <Field label="Fecha">
              <input
                required
                type="date"
                value={values.date}
                onChange={(event) => update('date', event.target.value)}
                className="input"
              />
            </Field>

            <Field label="Metodo de pago">
              <select
                value={values.paymentMethod}
                onChange={(event) => update('paymentMethod', event.target.value)}
                className="input appearance-none"
              >
                {PAYMENT_METHODS.map((method) => <option key={method} className="bg-white dark:bg-slate-800">{method}</option>)}
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
        </div>

        <div className="safe-action border-t border-white/20 bg-white/25 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/35">
          <button
            disabled={saving}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all hover:bg-teal-500 disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? 'Guardando...' : 'Guardar transaccion'}
          </button>
        </div>
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
