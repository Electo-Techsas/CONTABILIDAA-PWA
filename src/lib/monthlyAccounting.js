export const DEFAULT_ALERT_SETTINGS = {
  monthlyBudget: 0,
  categoryLimitPercent: 35,
  monthOverMonthIncreasePercent: 20,
  alertNegativeBalance: true
};

const monthFormatter = new Intl.DateTimeFormat('es-CO', {
  month: 'long',
  year: 'numeric'
});

export function getCurrentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function formatMonthLabel(month) {
  if (!month || month === 'Sin fecha') return 'Sin fecha';
  const [year, monthNumber] = month.split('-').map(Number);
  return monthFormatter.format(new Date(year, monthNumber - 1, 1));
}

export function buildMonthlyAccounting(transactions, now = new Date()) {
  const currentMonth = getCurrentMonthKey(now);
  const grouped = new Map();

  transactions.forEach((item) => {
    const month = item.date?.slice(0, 7) || 'Sin fecha';
    const amount = Number(item.amount) || 0;
    const record = grouped.get(month) || {
      month,
      label: formatMonthLabel(month),
      income: 0,
      expense: 0,
      net: 0,
      categories: new Map(),
      transactionCount: 0
    };

    record.transactionCount += 1;

    if (item.type === 'Ingreso') {
      record.income += amount;
    }

    if (item.type === 'Egreso') {
      record.expense += amount;
      record.categories.set(item.category, (record.categories.get(item.category) || 0) + amount);
    }

    record.net = record.income - record.expense;
    grouped.set(month, record);
  });

  const months = Array.from(grouped.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((record, index, list) => {
      const topCategoryEntry = Array.from(record.categories.entries()).sort((a, b) => b[1] - a[1])[0];
      const previous = list[index - 1];
      const expenseDelta = previous ? record.expense - previous.expense : 0;
      const expenseDeltaPercent = previous?.expense ? (expenseDelta / previous.expense) * 100 : 0;
      const netDelta = previous ? record.net - previous.net : 0;

      return {
        ...record,
        status: record.month < currentMonth ? 'closed' : 'open',
        topCategory: topCategoryEntry?.[0] || 'Sin gastos',
        topCategoryAmount: topCategoryEntry?.[1] || 0,
        topCategoryPercent: record.expense && topCategoryEntry ? (topCategoryEntry[1] / record.expense) * 100 : 0,
        expenseDelta,
        expenseDeltaPercent,
        netDelta
      };
    });

  return {
    currentMonth,
    months,
    closedMonths: months.filter((month) => month.status === 'closed'),
    activeMonth: months.find((month) => month.month === currentMonth) || months[months.length - 1] || null
  };
}

export function buildSpendingAlerts(accounting, settings = DEFAULT_ALERT_SETTINGS) {
  const alerts = [];
  const active = accounting.activeMonth;

  if (!active) return alerts;

  if (settings.monthlyBudget > 0 && active.expense > settings.monthlyBudget) {
    alerts.push({
      title: 'Presupuesto mensual superado',
      detail: `El gasto de ${active.label} ya paso el limite configurado.`
    });
  }

  if (active.topCategoryPercent >= settings.categoryLimitPercent && active.expense > 0) {
    alerts.push({
      title: 'Gasto concentrado',
      detail: `${active.topCategory} concentra ${Math.round(active.topCategoryPercent)}% de los egresos del mes.`
    });
  }

  if (
    settings.monthOverMonthIncreasePercent > 0 &&
    active.expenseDeltaPercent >= settings.monthOverMonthIncreasePercent
  ) {
    alerts.push({
      title: 'Egresos en aumento',
      detail: `Este mes gastaste ${Math.round(active.expenseDeltaPercent)}% mas que el mes anterior.`
    });
  }

  if (settings.alertNegativeBalance && active.net < 0) {
    alerts.push({
      title: 'Mes en negativo',
      detail: `Los egresos de ${active.label} superan los ingresos registrados.`
    });
  }

  return alerts;
}
