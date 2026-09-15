import { BellRing, CheckCircle2, PiggyBank, Plus, Target, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { addAmounts, formatMoney, getCurrencyStep, normalizeAmount } from '../lib/currency';
import CollapsibleSection from './CollapsibleSection';

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export default function PlanningPanel({
  transactions,
  categories,
  budgets,
  onBudgetsChange,
  goals,
  onGoalsChange,
  recurringItems,
  onRecurringChange,
  onCreateRecurring,
  currency
}) {
  const money = (value) => formatMoney(value, currency);
  const amountStep = getCurrencyStep(currency);
  const [budgetDraft, setBudgetDraft] = useState({ category: categories[0] || 'Otros', amount: '' });
  const [goalDraft, setGoalDraft] = useState({ name: '', target: '', saved: '' });
  const [recurringDraft, setRecurringDraft] = useState({
    description: '',
    amount: '',
    category: categories[0] || 'Otros',
    day: '1'
  });

  const month = currentMonthKey();
  const monthlyExpenses = useMemo(() => {
    const map = new Map();
    transactions
      .filter((item) => item.type === 'Egreso' && item.date?.startsWith(month))
      .forEach((item) => {
        map.set(item.category, addAmounts([map.get(item.category) || 0, item.amount], currency));
      });
    return map;
  }, [transactions, month, currency]);

  const addBudget = (event) => {
    event.preventDefault();
    const amount = normalizeAmount(budgetDraft.amount, currency);
    if (!budgetDraft.category || !Number.isFinite(amount) || amount <= 0) return;
    onBudgetsChange({ ...budgets, [budgetDraft.category]: amount });
    setBudgetDraft((current) => ({ ...current, amount: '' }));
  };

  const addGoal = (event) => {
    event.preventDefault();
    const target = normalizeAmount(goalDraft.target, currency);
    const saved = normalizeAmount(goalDraft.saved || 0, currency);
    if (!goalDraft.name.trim() || !Number.isFinite(target) || target <= 0) return;
    onGoalsChange([
      ...goals,
      {
        id: crypto.randomUUID(),
        name: goalDraft.name.trim(),
        target,
        saved: Number.isFinite(saved) ? saved : 0
      }
    ]);
    setGoalDraft({ name: '', target: '', saved: '' });
  };

  const addRecurring = (event) => {
    event.preventDefault();
    const amount = normalizeAmount(recurringDraft.amount, currency);
    const day = Number(recurringDraft.day);
    if (!recurringDraft.description.trim() || !Number.isFinite(amount) || amount <= 0) return;
    onRecurringChange([
      ...recurringItems,
      {
        id: crypto.randomUUID(),
        ...recurringDraft,
        amount,
        day: Math.min(Math.max(day || 1, 1), 28),
        lastCreatedMonth: ''
      }
    ]);
    setRecurringDraft({ description: '', amount: '', category: categories[0] || 'Otros', day: '1' });
  };

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <CollapsibleSection id="plan-budgets" icon={Target} title="Presupuestos" subtitle="Límites por categoría este mes">
        <form onSubmit={addBudget} className="grid gap-2 sm:grid-cols-[1fr_0.8fr_auto] xl:grid-cols-1">
          <select value={budgetDraft.category} onChange={(event) => setBudgetDraft((current) => ({ ...current, category: event.target.value }))} className="input appearance-none">
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <input type="number" min={amountStep} step={amountStep} value={budgetDraft.amount} onChange={(event) => setBudgetDraft((current) => ({ ...current, amount: event.target.value }))} placeholder={`Límite ${currency}`} className="input" />
          <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-4 text-white">
            <Plus size={17} />
          </button>
        </form>
        <div className="mt-4 space-y-3">
          {Object.entries(budgets).map(([category, limit]) => {
            const spent = monthlyExpenses.get(category) || 0;
            const percent = Math.min((spent / limit) * 100, 100);
            return (
              <div key={category} className="rounded-2xl bg-white/25 p-3 dark:bg-slate-950/20">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-ink dark:text-white">{category}</span>
                  <button type="button" onClick={() => {
                    const next = { ...budgets };
                    delete next[category];
                    onBudgetsChange(next);
                  }} className="text-orange-500" title="Eliminar presupuesto">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                  <div className={`h-full rounded-full ${percent >= 100 ? 'bg-orange-500' : 'bg-teal-500'}`} style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted dark:text-slate-400">{money(spent)} de {money(limit)}</p>
              </div>
            );
          })}
          {!Object.keys(budgets).length && <EmptyText text="Aun no hay presupuestos por categoria." />}
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="plan-goals" icon={PiggyBank} title="Metas de ahorro" subtitle="Objetivos y avance guardado">
        <form onSubmit={addGoal} className="grid gap-2">
          <input value={goalDraft.name} onChange={(event) => setGoalDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre de la meta" className="input" />
          <div className="grid gap-2 sm:grid-cols-2">
            <input type="number" min={amountStep} step={amountStep} value={goalDraft.target} onChange={(event) => setGoalDraft((current) => ({ ...current, target: event.target.value }))} placeholder={`Meta ${currency}`} className="input" />
            <input type="number" min="0" step={amountStep} value={goalDraft.saved} onChange={(event) => setGoalDraft((current) => ({ ...current, saved: event.target.value }))} placeholder="Ahorrado inicial" className="input" />
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-semibold text-white">
            <Plus size={16} />
            Crear meta
          </button>
        </form>
        <div className="mt-4 space-y-3">
          {goals.map((goal) => {
            const percent = Math.min((Number(goal.saved) / Number(goal.target)) * 100, 100);
            return (
              <div key={goal.id} className="rounded-2xl bg-white/25 p-3 dark:bg-slate-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">{goal.name}</p>
                    <p className="text-xs text-muted dark:text-slate-400">{money(goal.saved)} de {money(goal.target)}</p>
                  </div>
                  <button type="button" onClick={() => onGoalsChange(goals.filter((item) => item.id !== goal.id))} className="text-orange-500" title="Eliminar meta">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
                </div>
                <GoalContribution goal={goal} goals={goals} onGoalsChange={onGoalsChange} currency={currency} />
              </div>
            );
          })}
          {!goals.length && <EmptyText text="Aun no tienes metas activas." />}
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="plan-recurring" icon={BellRing} title="Recurrentes" subtitle="Gastos fijos y recordatorios">
        <form onSubmit={addRecurring} className="grid gap-2">
          <input value={recurringDraft.description} onChange={(event) => setRecurringDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Arriendo, Netflix, servicios..." className="input" />
          <div className="grid gap-2 sm:grid-cols-2">
            <input type="number" min={amountStep} step={amountStep} value={recurringDraft.amount} onChange={(event) => setRecurringDraft((current) => ({ ...current, amount: event.target.value }))} placeholder={`Monto ${currency}`} className="input" />
            <input type="number" min="1" max="28" value={recurringDraft.day} onChange={(event) => setRecurringDraft((current) => ({ ...current, day: event.target.value }))} placeholder="Dia" className="input" />
          </div>
          <select value={recurringDraft.category} onChange={(event) => setRecurringDraft((current) => ({ ...current, category: event.target.value }))} className="input appearance-none">
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-semibold text-white">
            <Plus size={16} />
            Programar
          </button>
        </form>
        <div className="mt-4 space-y-3">
          {recurringItems.map((item) => {
            const isCreated = item.lastCreatedMonth === month;
            return (
              <div key={item.id} className="rounded-2xl bg-white/25 p-3 dark:bg-slate-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">{item.description}</p>
                    <p className="text-xs text-muted dark:text-slate-400">Día {item.day} - {money(item.amount)}</p>
                  </div>
                  <button type="button" onClick={() => onRecurringChange(recurringItems.filter((current) => current.id !== item.id))} className="text-orange-500" title="Eliminar recurrente">
                    <Trash2 size={15} />
                  </button>
                </div>
                <button type="button" disabled={isCreated} onClick={() => onCreateRecurring(item)} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/30 px-3 text-xs font-semibold text-ink disabled:opacity-50 dark:bg-white/10 dark:text-white">
                  <CheckCircle2 size={15} />
                  {isCreated ? 'Registrado este mes' : 'Registrar este mes'}
                </button>
              </div>
            );
          })}
          {!recurringItems.length && <EmptyText text="Aun no hay gastos recurrentes." />}
        </div>
      </CollapsibleSection>
    </section>
  );
}

function GoalContribution({ goal, goals, onGoalsChange, currency }) {
  const [amount, setAmount] = useState('');
  const applyContribution = (direction) => {
    const contribution = normalizeAmount(amount, currency);
    if (contribution <= 0) return;
    onGoalsChange(goals.map((item) => item.id === goal.id ? {
      ...item,
      saved: Math.min(Number(item.target), Math.max(0, addAmounts([item.saved, direction * contribution], currency)))
    } : item));
    setAmount('');
  };

  return (
    <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
      <input type="number" min={getCurrencyStep(currency)} step={getCurrencyStep(currency)} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Aporte" className="input min-w-0" />
      <button type="button" onClick={() => applyContribution(1)} className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white">Sumar</button>
      <button type="button" onClick={() => applyContribution(-1)} className="rounded-xl bg-white/30 px-3 py-2 text-xs font-semibold text-ink dark:bg-white/10 dark:text-white">Retirar</button>
    </div>
  );
}

function EmptyText({ text }) {
  return <p className="rounded-2xl bg-white/20 p-3 text-sm text-muted dark:bg-slate-950/20 dark:text-slate-400">{text}</p>;
}
