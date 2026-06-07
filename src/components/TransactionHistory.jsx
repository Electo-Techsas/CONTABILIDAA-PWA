import { Pencil, Trash2 } from 'lucide-react';

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

export default function TransactionHistory({
  transactions,
  filters,
  setFilters,
  categories,
  onEdit,
  onDelete
}) {
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section id="history" className="rounded-3xl border border-black/10 bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Historial de transacciones</h2>
          <p className="text-sm text-muted">{transactions.length} registros visibles</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)} className="input">
            <option>Todos</option>
            <option>Ingreso</option>
            <option>Egreso</option>
          </select>
          <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className="input">
            <option>Todas</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} className="input" />
          <input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} className="input" />
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr className="border-b border-black/10">
              <th className="py-3 pr-3">Fecha</th>
              <th className="py-3 pr-3">Tipo</th>
              <th className="py-3 pr-3">Categoria</th>
              <th className="py-3 pr-3">Descripcion</th>
              <th className="py-3 pr-3">Metodo</th>
              <th className="py-3 pr-3 text-right">Monto</th>
              <th className="py-3 pl-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.id} className="border-b border-black/5 last:border-0">
                <td className="py-3 pr-3 text-muted">{item.date}</td>
                <td className="py-3 pr-3">
                  <TypeBadge type={item.type} />
                </td>
                <td className="py-3 pr-3 font-medium text-ink">{item.category}</td>
                <td className="max-w-xs py-3 pr-3 text-muted">{item.description}</td>
                <td className="py-3 pr-3 text-muted">{item.paymentMethod}</td>
                <td className={`py-3 pr-3 text-right font-semibold ${item.type === 'Ingreso' ? 'text-positive' : 'text-negative'}`}>
                  {money.format(item.amount)}
                </td>
                <td className="py-3 pl-3">
                  <div className="flex justify-end gap-2">
                    <IconButton label="Editar" onClick={() => onEdit(item)} icon={Pencil} />
                    <IconButton label="Eliminar" onClick={() => onDelete(item.id)} icon={Trash2} danger />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {transactions.map((item) => (
          <article key={item.id} className="rounded-2xl border border-black/10 p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{item.category}</p>
                <p className="text-xs text-muted">{item.date} · {item.paymentMethod}</p>
              </div>
              <TypeBadge type={item.type} />
            </div>
            <p className="mb-3 text-sm text-muted">{item.description || 'Sin descripcion'}</p>
            <div className="flex items-center justify-between">
              <p className={`text-base font-semibold ${item.type === 'Ingreso' ? 'text-positive' : 'text-negative'}`}>
                {money.format(item.amount)}
              </p>
              <div className="flex gap-2">
                <IconButton label="Editar" onClick={() => onEdit(item)} icon={Pencil} />
                <IconButton label="Eliminar" onClick={() => onDelete(item.id)} icon={Trash2} danger />
              </div>
            </div>
          </article>
        ))}
      </div>

      {!transactions.length && (
        <div className="grid min-h-40 place-items-center rounded-2xl bg-black/[0.03] text-sm text-muted">
          No hay transacciones con los filtros actuales.
        </div>
      )}
    </section>
  );
}

function TypeBadge({ type }) {
  const isIncome = type === 'Ingreso';
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isIncome ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
      {type}
    </span>
  );
}

function IconButton({ label, icon: Icon, onClick, danger }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-full border border-black/10 ${danger ? 'text-negative' : 'text-muted'}`}
    >
      <Icon size={17} />
    </button>
  );
}
