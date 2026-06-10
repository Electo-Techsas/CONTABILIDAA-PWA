import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
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

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

function monthKey(date) {
  return date?.slice(0, 7) || 'Sin fecha';
}

function buildMonthlyData(transactions) {
  const map = new Map();
  transactions.forEach((item) => {
    const key = monthKey(item.date);
    const current = map.get(key) || { month: key, ingresos: 0, egresos: 0 };
    if (item.type === 'Ingreso') current.ingresos += Number(item.amount);
    if (item.type === 'Egreso') current.egresos += Number(item.amount);
    map.set(key, current);
  });
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

function buildCategoryData(transactions) {
  const map = new Map();
  transactions
    .filter((item) => item.type === 'Egreso')
    .forEach((item) => {
      map.set(item.category, (map.get(item.category) || 0) + Number(item.amount));
    });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function buildPaymentMethodData(allTransactions) {
  const map = new Map();
  allTransactions.forEach((item) => {
    const method = item.paymentMethod || 'Otro';
    const current = map.get(method) || 0;
    if (item.type === 'Ingreso') {
      map.set(method, current + Number(item.amount));
    } else if (item.type === 'Egreso') {
      map.set(method, current - Number(item.amount));
    }
  });
  return Array.from(map.entries()).map(([method, balance]) => ({ method, balance }));
}

export default function Dashboard({ transactions, allTransactions, loading, onlyCharts = false }) {
  const tForAbsoluteMetrics = allTransactions || transactions;
  
  const realIncome = tForAbsoluteMetrics.filter((item) => item.type === 'Ingreso').reduce((sum, item) => sum + Number(item.amount), 0);
  const realExpense = tForAbsoluteMetrics.filter((item) => item.type === 'Egreso').reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = realIncome - realExpense;

  const income = transactions.filter((item) => item.type === 'Ingreso').reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = transactions.filter((item) => item.type === 'Egreso').reduce((sum, item) => sum + Number(item.amount), 0);
  
  const monthly = buildMonthlyData(transactions);
  const categories = buildCategoryData(transactions);
  const paymentMethodsData = buildPaymentMethodData(tForAbsoluteMetrics);
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

  // Si estamos en la pestaña de gráficos puros, saltamos las tarjetas de métricas
  if (onlyCharts) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <article className="rounded-3xl liquid-card p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink dark:text-white">Ingresos vs egresos</h2>
            <p className="text-sm text-muted dark:text-slate-400">Comparativo mensual segun filtros activos</p>
          </div>
          <div className="h-72 chart-glass">
            {loading ? (
              <div className="grid h-full place-items-center text-sm text-muted dark:text-slate-400">Cargando datos...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
  data={monthly}
  margin={{
    top: 10,
    right: 20,
    left: 10,
    bottom: 10
  }}
>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{
  fill: '#94a3b8',
  fontSize: 12
}} />
                  <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} tick={{
  fill: '#94a3b8',
  fontSize: 12
}} />
                  <Tooltip
  formatter={(value) => money.format(value)}
  contentStyle={{
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '20px',
    color: '#ffffff',
    boxShadow: '0 8px 32px rgba(0,0,0,.18)'
  }}
/>
                  <Legend
  wrapperStyle={{
    color: '#94a3b8',
    fontSize: '12px'
  }}
/>
                  <Bar
  dataKey="ingresos"
  fill="rgba(20,184,166,.85)"
  radius={[18, 18, 0, 0]}
/>

<Bar
  dataKey="egresos"
  fill="rgba(249,115,22,.85)"
  radius={[18, 18, 0, 0]}
/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-3xl liquid-card p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink dark:text-white">Egresos por categoria</h2>
            <p className="text-sm text-muted dark:text-slate-400">Distribucion de gastos</p>
          </div>
          <div className="h-72 chart-glass">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
  data={categories}
  dataKey="value"
  nameKey="name"
  innerRadius={70}
  outerRadius={105}
  paddingAngle={6}
  cornerRadius={12}
>
                  {categories.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
  formatter={(value) => money.format(value)}
  contentStyle={{
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '20px',
    color: '#ffffff',
    boxShadow: '0 8px 32px rgba(0,0,0,.18)'
  }}
/>
                <Legend
  wrapperStyle={{
    color: '#94a3b8',
    fontSize: '12px'
  }}
/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    );
  }

  return (
    <section id="dashboard" className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric title="Saldo actual" value={money.format(balance)} icon={Wallet} tone="primary" />
        <Metric title="Ingresos" value={money.format(income)} icon={ArrowUpRight} tone="positive" />
        <Metric title="Egresos" value={money.format(expense)} icon={ArrowDownRight} tone="negative" />
      </div>

      {/* Sección Solucionada: ¿Dónde está mi dinero? */}
      <article className="liquid-card rounded-[28px] p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-ink dark:text-white">¿Dónde está mi dinero?</h2>
          <p className="text-sm text-muted dark:text-slate-400">Distribución del saldo real acumulado por método de pago</p>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          {paymentMethodsData.map(({ method, balance: mBalance }) => (
            <div
  key={method}
  className="rounded-2xl liquid-card p-4"
>
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={14} className="text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">{method}</span>
              </div>
              <p className={`text-lg font-bold ${mBalance >= 0 ? 'text-ink dark:text-white' : 'text-orange-600 dark:text-orange-400'}`}>
                {money.format(mBalance)}
              </p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <article className="rounded-3xl liquid-card p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink dark:text-white">Ingresos vs egresos</h2>
            <p className="text-sm text-muted dark:text-slate-400">Comparativo mensual segun filtros activos</p>
          </div>
          <div className="h-72 chart-glass">
            {loading ? (
              <div className="grid h-full place-items-center text-sm text-muted dark:text-slate-400">Cargando datos...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
  data={monthly}
  margin={{
    top: 10,
    right: 20,
    left: 10,
    bottom: 10
  }}
>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{
  fill: '#94a3b8',
  fontSize: 12
}} />
                  <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} tick={{
  fill: '#94a3b8',
  fontSize: 12
}} />
                  <Tooltip
  formatter={(value) => money.format(value)}
  contentStyle={{
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '20px',
    color: '#ffffff',
    boxShadow: '0 8px 32px rgba(0,0,0,.18)'
  }}
/>
                  <Legend
  wrapperStyle={{
    color: '#94a3b8',
    fontSize: '12px'
  }}
/>
                  <Bar
  dataKey="ingresos"
  fill="rgba(20,184,166,.85)"
  radius={[18, 18, 0, 0]}
/>

<Bar
  dataKey="egresos"
  fill="rgba(249,115,22,.85)"
  radius={[18, 18, 0, 0]}
/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-3xl liquid-card p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink dark:text-white">Egresos por categoria</h2>
            <p className="text-sm text-muted dark:text-slate-400">Distribucion de gastos</p>
          </div>
          <div className="h-72 chart-glass">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
  data={categories}
  dataKey="value"
  nameKey="name"
  innerRadius={70}
  outerRadius={105}
  paddingAngle={6}
  cornerRadius={12}
>
                  {categories.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
  formatter={(value) => money.format(value)}
  contentStyle={{
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '20px',
    color: '#ffffff',
    boxShadow: '0 8px 32px rgba(0,0,0,.18)'
  }}
/>
                <Legend
  wrapperStyle={{
    color: '#94a3b8',
    fontSize: '12px'
  }}
/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}

function Metric({ title, value, icon: Icon, tone }) {
  const toneClass = {
    primary: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    negative: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
  }[tone];

  return (
    <article className="liquid-card rounded-[28px] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted dark:text-slate-400">{title}</p>
        <div
  className={`grid h-12 w-12 place-items-center rounded-2xl liquid-button ${toneClass}`}
>
          <Icon size={20} />
        </div>
      </div>
      <p className="break-words text-3xl font-bold text-ink dark:text-white">{value}</p>
    </article>
  );
}