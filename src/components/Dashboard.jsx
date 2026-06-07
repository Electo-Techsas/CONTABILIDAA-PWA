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

export default function Dashboard({ transactions, loading }) {
  const income = transactions.filter((item) => item.type === 'Ingreso').reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = transactions.filter((item) => item.type === 'Egreso').reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = income - expense;
  const monthly = buildMonthlyData(transactions);
  const categories = buildCategoryData(transactions);
  const colors = ['#0f766e', '#2563eb', '#c2410c', '#7c3aed', '#ca8a04', '#0e7490'];

  return (
    <section id="dashboard" className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric title="Saldo actual" value={money.format(balance)} icon={Wallet} tone="primary" />
        <Metric title="Ingresos" value={money.format(income)} icon={ArrowUpRight} tone="positive" />
        <Metric title="Egresos" value={money.format(expense)} icon={ArrowDownRight} tone="negative" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <article id="charts" className="rounded-3xl border border-black/10 bg-white p-4 shadow-soft">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Ingresos vs egresos</h2>
            <p className="text-sm text-muted">Comparativo mensual segun filtros activos</p>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="grid h-full place-items-center text-sm text-muted">Cargando datos...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => money.format(value)} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#16794c" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="egresos" fill="#c2410c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-black/10 bg-white p-4 shadow-soft">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Egresos por categoria</h2>
            <p className="text-sm text-muted">Distribucion de gastos</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={4}>
                  {categories.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => money.format(value)} />
                <Legend />
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
    primary: 'bg-primary/10 text-primary',
    positive: 'bg-positive/10 text-positive',
    negative: 'bg-negative/10 text-negative'
  }[tone];

  return (
    <article className="rounded-3xl border border-black/10 bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{title}</p>
        <div className={`grid h-10 w-10 place-items-center rounded-2xl ${toneClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="break-words text-2xl font-semibold text-ink">{value}</p>
    </article>
  );
}
