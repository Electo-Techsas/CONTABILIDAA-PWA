import { BarChart3, FileSpreadsheet, Home, ReceiptText, Settings } from 'lucide-react';

const items = [
  { key: 'dashboard', label: 'Inicio', icon: Home },
  { key: 'charts', label: 'Graficos', icon: BarChart3 },
  { key: 'history', label: 'Historial', icon: ReceiptText },
  { key: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { key: 'settings', label: 'Ajustes', icon: Settings }
];

export default function Layout({ children, active }) {
  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="hidden w-72 border-r border-black/10 bg-white px-4 py-6 lg:block">
        <div className="mb-8 px-3">
          <p className="text-sm font-semibold text-primary">FinanceOS</p>
          <p className="text-xs text-muted">PWA contable</p>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <a
                key={item.key}
                href={`#${item.key}`}
                className={`flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium ${
                  isActive ? 'bg-primary text-white' : 'text-muted hover:bg-black/5'
                }`}
              >
                <Icon size={19} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <a
                key={item.key}
                href={`#${item.key}`}
                className={`grid min-h-14 place-items-center rounded-2xl text-[11px] font-medium ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
