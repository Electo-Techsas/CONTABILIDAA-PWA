import { AlertTriangle, BellRing, CircleDollarSign, Plus, Tag, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SUPPORTED_CURRENCIES, getCurrency, getCurrencyStep, normalizeAmount } from '../lib/currency';
import CollapsibleSection from './CollapsibleSection';

export default function Settings({
  alertSettings,
  onAlertSettingsChange,
  accountLimits = {},
  onAccountLimitsChange,
  categories,
  onAddCategory,
  onRemoveCategory,
  onClearAll,
  currency,
  onCurrencyChange,
  paymentMethods,
  onPaymentMethodsChange,
  usedPaymentMethods = []
}) {
  const { user } = useAuth();
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [accountName, setAccountName] = useState('');
  const currencyInfo = getCurrency(currency);

  const handleClearAll = async () => {
    const confirmFirst = window.confirm('Seguro? Esto borrara TODO tu historial de transacciones de Supabase de forma irreversible.');
    if (!confirmFirst) return;

    const confirmSecond = window.confirm('Ultima palabra? No hay marcha atras.');
    if (!confirmSecond) return;

    try {
      setClearing(true);
      setMessage('');
      await onClearAll();
      setMessage('Historial borrado con exito.');
    } catch (err) {
      setMessage('Error al intentar borrar los datos.');
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  const updateAlert = (key, value) => {
    onAlertSettingsChange({
      ...alertSettings,
      [key]: value
    });
  };

  const updateAccountLimit = (method, value) => {
    onAccountLimitsChange({
      ...accountLimits,
      [method]: normalizeAmount(value, currency)
    });
  };

  const handleAddCategory = (event) => {
    event.preventDefault();
    onAddCategory(categoryName);
    setCategoryName('');
  };

  const addAccount = (event) => {
    event.preventDefault();
    const account = accountName.trim();
    if (!account || paymentMethods.some((method) => method.toLocaleLowerCase() === account.toLocaleLowerCase())) return;
    onPaymentMethodsChange([...paymentMethods, account]);
    setAccountName('');
  };

  const removeAccount = (account) => {
    if (paymentMethods.length === 1 || usedPaymentMethods.includes(account)) return;
    onPaymentMethodsChange(paymentMethods.filter((method) => method !== account));
    const nextLimits = { ...accountLimits };
    delete nextLimits[account];
    onAccountLimitsChange(nextLimits);
  };

  return (
    <section className="space-y-5 animate-fade-in">
      <article className="glass-premium-card rounded-[28px] p-5">
        <div className="mb-4 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary dark:text-teal-400">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink dark:text-white">Perfil de Usuario</h2>
            <p className="text-sm text-muted dark:text-slate-400">Sesion activa de Supabase</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/25 p-4 dark:bg-slate-950/20">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400">Correo Electronico</p>
          <p className="break-words text-base font-bold text-ink dark:text-white">{user?.email || 'No disponible'}</p>
        </div>
      </article>

      <CollapsibleSection id="settings-currency" icon={CircleDollarSign} title="Moneda de trabajo" subtitle="Se aplica a montos, presupuestos, metas y cálculos nuevos.">
        <select value={currency} onChange={(event) => onCurrencyChange(event.target.value)} className="input appearance-none">
          {Object.values(SUPPORTED_CURRENCIES).map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
        </select>
        <p className="mt-3 text-xs text-muted dark:text-slate-400">
          {currencyInfo.code === 'COP'
            ? 'COP opera en pesos enteros; no se admitirán fracciones al guardar movimientos nuevos.'
            : `${currencyInfo.code} opera con ${currencyInfo.minorUnit}; los importes se redondean a dos decimales.`}
        </p>
      </CollapsibleSection>

      <CollapsibleSection id="settings-account-alerts" icon={AlertTriangle} title="Alertas por cuenta" subtitle="Saldo mínimo para efectivo, Nequi y demás métodos">

        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.map((method) => (
            <SettingField key={method} label={`${method} mínimo (${currencyInfo.code})`}>
              <input
                min="0"
                step={getCurrencyStep(currency)}
                type="number"
                value={accountLimits[method] || 0}
                onChange={(event) => updateAccountLimit(method, event.target.value)}
                className="input"
              />
            </SettingField>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="settings-accounts" icon={CircleDollarSign} title="Cuentas" subtitle="Elige qué cuentas aparecen en tu saldo">
        <form onSubmit={addAccount} className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Nueva cuenta: Bancolombia, PayPal..." className="input" />
          <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-semibold text-white"><Plus size={16} />Agregar</button>
        </form>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {paymentMethods.map((method) => {
            const inUse = usedPaymentMethods.includes(method);
            return <div key={method} className="flex items-center justify-between gap-3 rounded-2xl bg-white/25 px-3 py-2 dark:bg-slate-950/20">
              <span className="truncate text-sm font-medium text-ink dark:text-white">{method}</span>
              <button type="button" disabled={inUse || paymentMethods.length === 1} onClick={() => removeAccount(method)} title={inUse ? 'No se puede eliminar porque tiene movimientos' : 'Eliminar cuenta'} className="grid h-9 w-9 place-items-center rounded-xl text-negative disabled:cursor-not-allowed disabled:opacity-35"><Trash2 size={16} /></button>
            </div>;
          })}
        </div>
        <p className="mt-3 text-xs text-muted dark:text-slate-400">Una cuenta con movimientos no se puede eliminar para conservar el historial.</p>
      </CollapsibleSection>

      <CollapsibleSection id="settings-spending-alerts" icon={BellRing} title="Alertas de gasto" subtitle="Reglas para resúmenes, comparaciones y cierres de mes">

        <div className="grid gap-4 md:grid-cols-2">
          <SettingField label={`Presupuesto mensual (${currencyInfo.code})`}>
            <input
              min="0"
              step={getCurrencyStep(currency)}
              type="number"
              value={alertSettings.monthlyBudget}
              onChange={(event) => updateAlert('monthlyBudget', normalizeAmount(event.target.value, currency))}
              className="input"
            />
          </SettingField>

          <SettingField label="Categoria dominante (%)">
            <input
              min="1"
              max="100"
              type="number"
              value={alertSettings.categoryLimitPercent}
              onChange={(event) => updateAlert('categoryLimitPercent', Number(event.target.value))}
              className="input"
            />
          </SettingField>

          <SettingField label="Aumento mensual de egresos (%)">
            <input
              min="0"
              max="300"
              type="number"
              value={alertSettings.monthOverMonthIncreasePercent}
              onChange={(event) => updateAlert('monthOverMonthIncreasePercent', Number(event.target.value))}
              className="input"
            />
          </SettingField>

          <label className="flex min-h-20 items-center justify-between gap-3 rounded-2xl bg-white/25 p-4 dark:bg-slate-950/20">
            <span>
              <span className="block text-sm font-semibold text-ink dark:text-white">Mes en negativo</span>
              <span className="text-xs text-muted dark:text-slate-400">Avisar si los egresos superan ingresos</span>
            </span>
            <input
              type="checkbox"
              checked={alertSettings.alertNegativeBalance}
              onChange={(event) => updateAlert('alertNegativeBalance', event.target.checked)}
              className="h-5 w-5 accent-teal-600"
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="settings-categories" icon={Tag} title="Gestión de categorías" subtitle="Administra tus etiquetas de gastos e ingresos">
        <form onSubmit={handleAddCategory} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Nueva categoria"
            className="input"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-teal-700"
          >
            <Plus size={16} />
            Agregar
          </button>
        </form>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category}
              className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/25 px-3 py-2 dark:border-white/10 dark:bg-black/25"
            >
              <span className="truncate text-sm font-medium text-ink dark:text-white">{category}</span>
              <button
                type="button"
                onClick={() => onRemoveCategory(category)}
                className="liquid-button grid h-9 w-9 shrink-0 place-items-center rounded-xl text-negative"
                title={`Eliminar ${category}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <article className="glass-premium-card rounded-[28px] border-negative/20 p-5">
        <div className="mb-4 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-negative/10 text-negative">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-negative">Zona de Peligro</h2>
            <p className="text-sm text-muted dark:text-slate-400">Acciones destructivas irreversibles</p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 rounded-xl p-3 text-sm font-medium ${message.includes('exito') ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
            {message}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white/25 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-slate-950/20">
          <div>
            <h4 className="text-sm font-semibold text-ink dark:text-white">Borrado de Emergencia</h4>
            <p className="text-xs text-muted dark:text-slate-400">Limpia por completo la tabla de transacciones vinculada a tu cuenta.</p>
          </div>
          <button
            type="button"
            disabled={clearing}
            onClick={handleClearAll}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-negative hover:bg-negative/90 px-4 text-xs font-semibold text-white shadow-md shadow-negative/20 transition-all disabled:opacity-50"
          >
            <Trash2 size={14} />
            {clearing ? 'Borrando...' : 'Borrar todo el historial'}
          </button>
        </div>
      </article>
    </section>
  );
}

function SettingField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}
