import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarCheck,
  SlidersHorizontal,
  TrendingUp,
  Wallet
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { buildAccountBalances, isRealExpense, isRealIncome, sumAccountBalances } from '../lib/financeFeatures';
import { buildMonthlyAccounting, buildSpendingAlerts, DEFAULT_ALERT_SETTINGS } from '../lib/monthlyAccounting';
import { addAmounts, formatMoney } from '../lib/currency';
import CollapsibleSection from './CollapsibleSection';

const colors = [
  '#14b8a6',
  '#3b82f6',
  '#f97316',
  '#8b5cf6',
  '#f59e0b',
  '#06b6d4',
  '#10b981',
  '#ec4899'
];

function monthKey(date) {
  return date?.slice(0, 7) || 'Sin fecha';
}

function buildMonthlyData(transactions, currency) {
  const map = new Map();

  transactions.forEach((item) => {
    if (!isRealIncome(item) && !isRealExpense(item)) return;

    const key = monthKey(item.date);
    const current = map.get(key) || { month: key, ingresos: 0, egresos: 0 };
    if (isRealIncome(item)) current.ingresos = addAmounts([current.ingresos, item.amount], currency);
    if (isRealExpense(item)) current.egresos = addAmounts([current.egresos, item.amount], currency);
    map.set(key, current);
  });

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

function buildCategoryData(transactions, currency) {
  const map = new Map();

  transactions
    .filter((item) => isRealExpense(item))
    .forEach((item) => {
      map.set(item.category, addAmounts([map.get(item.category) || 0, item.amount], currency));
    });

  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export default function Dashboard({
  transactions,
  allTransactions,
  loading,
  onlyCharts = false,
  alertSettings = DEFAULT_ALERT_SETTINGS,
  accountLimits = {},
  onTransfer,
  onAdjust,
  currency,
  paymentMethods
}) {
  const tForAbsoluteMetrics = allTransactions || transactions;
  const money = (value) => formatMoney(value, currency);
  const balance = sumAccountBalances(tForAbsoluteMetrics, currency, paymentMethods);
  const income = addAmounts(transactions.filter((item) => isRealIncome(item)).map((item) => item.amount), currency);
  const expense = addAmounts(transactions.filter((item) => isRealExpense(item)).map((item) => item.amount), currency);
  const monthly = buildMonthlyData(transactions, currency);
  const chartCategories = buildCategoryData(transactions, currency);
  const paymentMethodsData = buildAccountBalances(tForAbsoluteMetrics, currency, paymentMethods);
  const accounting = buildMonthlyAccounting(tForAbsoluteMetrics, new Date(), currency);
  const alerts = buildSpendingAlerts(accounting, alertSettings);

  if (onlyCharts) {
    return <ChartsGrid monthly={monthly} categories={chartCategories} loading={loading} money={money} />;
  }

  return (
    <section id="dashboard" className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Metric title="Saldo actual" value={money(balance)} icon={Wallet} tone="primary" />
        </div>
        <Metric title="Ingresos" value={money(income)} icon={ArrowUpRight} tone="positive" />
        <Metric title="Egresos" value={money(expense)} icon={ArrowDownRight} tone="negative" />
      </div>

      <CollapsibleSection
        id="dashboard-accounts"
        icon={Wallet}
        title="Dónde está mi dinero"
        subtitle="Saldo acumulado por cuenta"
        actions={<>
            <button
              type="button"
              onClick={() => onTransfer?.()}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-teal-600 px-2.5 text-[11px] font-semibold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-500 sm:h-10 sm:gap-2 sm:rounded-2xl sm:px-3 sm:text-xs"
            >
              <ArrowLeftRight size={15} />
              Transferir
            </button>
            <button
              type="button"
              onClick={() => onAdjust?.()}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-white/30 px-2.5 text-[11px] font-semibold text-ink transition-all hover:bg-white/50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 sm:h-10 sm:gap-2 sm:rounded-2xl sm:px-3 sm:text-xs"
            >
              <SlidersHorizontal size={15} />
              Ajustar
            </button>
        </>}
      >

        <div className="divide-y divide-white/20 overflow-hidden rounded-2xl bg-white/20 dark:divide-white/10 dark:bg-slate-950/20">
          {paymentMethodsData.map(({ method, balance: methodBalance }) => {
            const limit = Number(accountLimits[method] || 0);
            const isLow = limit > 0 && methodBalance <= limit;

            return (
              <div key={method} className="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Wallet size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink dark:text-white">{method}</p>
                    {isLow && <p className="text-xs font-semibold text-orange-600 dark:text-orange-300">Saldo bajo</p>}
                  </div>
                </div>
                <p className={`shrink-0 text-sm font-bold ${methodBalance >= 0 ? 'text-ink dark:text-white' : 'text-orange-600 dark:text-orange-400'}`}>
                  {money(methodBalance)}
                </p>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <MonthlyAccountingPanel accounting={accounting} alerts={alerts} money={money} />
      <ChartsGrid monthly={monthly} categories={chartCategories} loading={loading} money={money} compact />
    </section>
  );
}

function ChartsGrid({ monthly, categories, loading, money }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
      <CollapsibleSection id="charts-income-expense" title="Ingresos vs egresos" subtitle="Comparativo mensual según filtros activos" className="rounded-3xl p-4 sm:p-5">
        <div className="h-72 chart-glass">
          {loading ? (
            <div className="grid h-full place-items-center text-sm text-muted dark:text-slate-400">Cargando datos...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip formatter={(value) => money(value)} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Bar dataKey="ingresos" fill="rgba(20,184,166,.85)" radius={[18, 18, 0, 0]} />
                <Bar dataKey="egresos" fill="rgba(249,115,22,.85)" radius={[18, 18, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="charts-categories" title="Egresos por categoría" subtitle="Distribución de gastos" className="rounded-3xl p-4 sm:p-5">
        <div className="h-72 chart-glass">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categories} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={6} cornerRadius={12}>
                {categories.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(value)} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>
    </div>
  );
}

const tooltipStyle = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '20px',
  color: '#ffffff',
  boxShadow: '0 8px 32px rgba(0,0,0,.18)'
};

function MonthlyAccountingPanel({ accounting, alerts, money }) {
  const active = accounting.activeMonth;
  const recentClosed = accounting.closedMonths.slice(-3).reverse();

  if (!active) {
    return (
      <article className="glass-premium-card rounded-[28px] p-5">
        <h2 className="text-base font-semibold text-ink dark:text-white">Cierre mensual automatico</h2>
        <p className="mt-2 text-sm text-muted dark:text-slate-400">
          Cuando registres movimientos, la app empezara a cerrar meses anteriores y mostrar comparaciones.
        </p>
      </article>
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="glass-premium-card rounded-[28px] p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink dark:text-white">Cierre mensual automatico</h2>
            <p className="text-sm text-muted dark:text-slate-400">
              {active.status === 'closed' ? 'Ultimo mes cerrado' : 'Mes actual en seguimiento'}: {active.label}
            </p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl liquid-button text-teal-600 dark:text-teal-400">
            <CalendarCheck size={19} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat label="Ingresos" value={money(active.income)} />
          <MiniStat label="Egresos" value={money(active.expense)} tone="negative" />
          <MiniStat label="Resultado" value={money(active.net)} tone={active.net >= 0 ? 'positive' : 'negative'} />
        </div>

        <div className="mt-4 rounded-2xl bg-white/25 p-4 dark:bg-slate-950/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
            <TrendingUp size={16} className="text-teal-600 dark:text-teal-400" />
            Resumen inteligente
          </div>
          <p className="mt-2 text-sm text-muted dark:text-slate-300">
            El mayor gasto esta en <strong>{active.topCategory}</strong> con {money(active.topCategoryAmount)}
            {' '}({Math.round(active.topCategoryPercent)}% de los egresos). Frente al mes anterior, los egresos
            {' '}{active.expenseDelta >= 0 ? 'subieron' : 'bajaron'} {money(Math.abs(active.expenseDelta))}.
          </p>
        </div>
      </article>

      <article className="glass-premium-card rounded-[28px] p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-ink dark:text-white">Alertas y meses cerrados</h2>
          <p className="text-sm text-muted dark:text-slate-400">Configurables desde ajustes</p>
        </div>

        <div className="space-y-3">
          {alerts.length ? (
            alerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-300">
                  <AlertTriangle size={16} />
                  {alert.title}
                </div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{alert.detail}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              Sin alertas activas para el mes en seguimiento.
            </div>
          )}

          {recentClosed.map((month) => (
            <div key={month.month} className="flex items-center justify-between gap-3 rounded-2xl bg-white/25 p-3 dark:bg-slate-950/20">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">{month.label}</p>
                <p className="text-xs text-muted dark:text-slate-400">Cerrado automaticamente</p>
              </div>
              <p className={`text-sm font-bold ${month.net >= 0 ? 'text-positive' : 'text-negative'}`}>
                {money(month.net)}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function MiniStat({ label, value, tone }) {
  const toneClass = {
    positive: 'text-positive',
    negative: 'text-negative'
  }[tone] || 'text-ink dark:text-white';

  return (
    <div className="rounded-2xl bg-white/25 p-3 dark:bg-slate-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400">{label}</p>
      <p className={`mt-1 break-words text-lg font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Metric({ title, value, icon: Icon, tone }) {
  const setup = {
    primary: {
      toneClass: 'text-teal-600 dark:text-teal-400',
      badgeBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      animClass: 'animate-levitate-slow',
      extraText: 'Disponible total'
    },
    positive: {
      toneClass: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      animClass: 'animate-levitate-delayed',
      extraText: 'Este mes'
    },
    negative: {
      toneClass: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      animClass: 'animate-levitate-fast',
      extraText: 'Este mes'
    }
  }[tone] || { toneClass: '', badgeBg: '', animClass: '', extraText: '' };

  const currentFormattedTime = new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <article className={`glass-premium-card ${setup.animClass} flex flex-col items-center justify-center rounded-[28px] p-6 transition-all`}>
      <div className="mb-3 flex w-full items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400/80 dark:text-slate-500">{title}</p>
        {Icon && (
          <div className={`flex items-center justify-center rounded-2xl p-2 ${setup.badgeBg}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <p className={`mb-3 w-full break-words text-center text-3xl font-extrabold tracking-tight ${tone === 'primary' ? 'text-ink dark:text-white' : setup.toneClass}`}>
        {value}
      </p>

      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${setup.badgeBg}`}>
        <span>{setup.extraText}</span>
      </div>

      {tone === 'primary' && (
        <p className="mt-3 text-[10px] font-medium text-slate-400/60 dark:text-slate-500/60">
          Actualizado: Hoy {currentFormattedTime}
        </p>
      )}
    </article>
  );
}
