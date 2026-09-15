import { ArrowLeftRight, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { PAYMENT_METHODS } from '../lib/schema';
import { getCurrencyStep } from '../lib/currency';

const today = () => new Date().toISOString().slice(0, 10);

export default function AccountActions({ action, account, onClose, onTransfer, onAdjust, currency, paymentMethods = PAYMENT_METHODS }) {
  const [values, setValues] = useState({
    from: account || paymentMethods[0],
    to: paymentMethods.find((method) => method !== account) || paymentMethods[0],
    paymentMethod: account || paymentMethods[0],
    direction: 'positivo',
    amount: '',
    date: today(),
    note: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const isTransfer = action === 'transfer';

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (isTransfer && values.from === values.to) {
      setError('El origen y el destino deben ser diferentes.');
      return;
    }

    try {
      setSaving(true);
      if (isTransfer) {
        await onTransfer(values);
      } else {
        await onAdjust(values);
      }
      onClose();
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar el movimiento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/15 p-0 backdrop-blur-sm dark:bg-black/50 sm:items-center sm:justify-center sm:p-4 lg:left-72">
      <form onSubmit={submit} className="glass-premium-card mb-[calc(5.75rem+env(safe-area-inset-bottom))] w-full max-w-lg rounded-[28px] shadow-2xl shadow-slate-300/60 dark:shadow-black/80 sm:mb-0">
        <div className="flex items-center justify-between gap-4 border-b border-white/20 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              {isTransfer ? <ArrowLeftRight size={19} /> : <SlidersHorizontal size={19} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink dark:text-white">
                {isTransfer ? 'Transferencia interna' : 'Ajustar saldo'}
              </h2>
              <p className="text-sm text-muted dark:text-slate-400">
                {isTransfer ? 'Mueve plata entre cuentas sin crear gasto.' : 'Corrige diferencias de caja.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="liquid-button grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-ink dark:text-white" title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          {error && (
            <div className="rounded-2xl border border-negative/20 bg-negative/10 p-3 text-sm font-medium text-negative dark:text-orange-400 sm:col-span-2">
              {error}
            </div>
          )}

          {isTransfer ? (
            <>
              <Field label="Desde">
                <select value={values.from} onChange={(event) => update('from', event.target.value)} className="input appearance-none">
                  {paymentMethods.map((method) => <option key={method}>{method}</option>)}
                </select>
              </Field>
              <Field label="Hacia">
                <select value={values.to} onChange={(event) => update('to', event.target.value)} className="input appearance-none">
                  {paymentMethods.map((method) => <option key={method}>{method}</option>)}
                </select>
              </Field>
            </>
          ) : (
            <>
              <Field label="Cuenta">
                <select value={values.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)} className="input appearance-none">
                  {paymentMethods.map((method) => <option key={method}>{method}</option>)}
                </select>
              </Field>
              <Field label="Tipo de ajuste">
                <select value={values.direction} onChange={(event) => update('direction', event.target.value)} className="input appearance-none">
                  <option value="positivo">Sumar saldo</option>
                  <option value="negativo">Restar saldo</option>
                </select>
              </Field>
            </>
          )}

          <Field label={`Monto (${currency})`}>
            <input required min={getCurrencyStep(currency)} step={getCurrencyStep(currency)} type="number" value={values.amount} onChange={(event) => update('amount', event.target.value)} className="input" />
          </Field>
          <Field label="Fecha">
            <input required type="date" value={values.date} onChange={(event) => update('date', event.target.value)} className="input" />
          </Field>
          <Field label="Nota" wide>
            <textarea value={values.note} onChange={(event) => update('note', event.target.value)} className="input resize-none" rows={3} placeholder="Opcional" />
          </Field>
        </div>

        <div className="safe-action border-t border-white/20 bg-white/25 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/35">
          <button disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all hover:bg-teal-500 disabled:opacity-60">
            {isTransfer ? <ArrowLeftRight size={17} /> : <SlidersHorizontal size={17} />}
            {saving ? 'Guardando...' : isTransfer ? 'Mover saldo' : 'Guardar ajuste'}
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
