// src/components/DashboardMirror.jsx

export default function DashboardMirror({
  activeTab,
  transactions
}) {
  if (activeTab !== 'dashboard') return null;

  const income = transactions
    .filter(t => t.type === 'Ingreso')
    .reduce((a, b) => a + Number(b.amount), 0);

  const expense = transactions
    .filter(t => t.type === 'Egreso')
    .reduce((a, b) => a + Number(b.amount), 0);

  const balance = income - expense;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      <div
        className="absolute inset-0 blur-[110px] opacity-[0.18] will-change-transform"
        style={{
          animation: 'ambientZoom 30s ease-in-out infinite',
          transformOrigin: 'center center'
        }}
      >

        {/* Tarjetas KPI */}
        <div className="grid gap-8 md:grid-cols-3 p-20">

          <div className="h-52 rounded-[50px] bg-teal-500/35">
            <div className="p-8 text-4xl font-bold">
              {balance}
            </div>
          </div>

          <div className="h-40 rounded-[40px] bg-emerald-500/40">
            <div className="p-8 text-4xl font-bold">
              {income}
            </div>
          </div>

          <div className="h-40 rounded-[40px] bg-orange-500/40">
            <div className="p-8 text-4xl font-bold">
              {expense}
            </div>
          </div>

        

        {/* Simulación de gráficos */}
        <div className="grid gap-10 xl:grid-cols-2 px-20">

          <div className="h-[420px] rounded-[70px] bg-teal-400/20" />

          <div className="h-[420px] rounded-[70px] bg-blue-400/20" />

        </div>

      </div>
    </div>
    </div>
  );
}
