import {
  BarChart3,
  FileSpreadsheet,
  Home,
  ReceiptText,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

import { useState, useEffect } from 'react';

const items = [
  { key: 'dashboard', label: 'Inicio', icon: Home },
  { key: 'charts', label: 'Gráficos', icon: BarChart3 },
  { key: 'history', label: 'Historial', icon: ReceiptText },
  { key: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { key: 'settings', label: 'Ajustes', icon: Settings }
];

export default function Layout({
  children,
  active,
  setActive
}) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme) {
        return savedTheme === 'dark';
      }

      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  return (
    /* CORRECCIÓN: Se cambió 'bg-surface dark:bg-black' por 'bg-transparent' para que se vean las burbujas del App.jsx */
    <div className="min-h-screen bg-transparent text-ink dark:text-white transition-colors duration-300 lg:flex relative overflow-hidden">

      {/* Fondo dinámico */}
      <div className="liquid-ambient fixed inset-0 z-0 pointer-events-none">
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col justify-between w-72 h-screen sticky top-0 z-20 border-r border-white/30 dark:border-white/10 liquid-sidebar px-4 py-6 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.10)]">

        <div>
          <div className="mb-8 px-3">
            <p className="text-sm font-bold text-primary dark:text-teal-400 tracking-wide">
              FinanceOS
            </p>

            <p className="text-xs text-muted dark:text-slate-400">
              PWA contable
            </p>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActive(item.key)}
                  className={`flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white dark:bg-teal-600 border border-teal-500/50 shadow-lg shadow-teal-600/20'
                      : 'text-muted dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-white/10 hover:text-ink dark:hover:text-white'
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Selector de tema */}
        <div className="px-3">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/10 backdrop-blur-md hover:bg-white/70 dark:hover:bg-white/15 transition-all"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400">
              Tema
            </span>

            <div
              className={`relative w-12 h-7 rounded-full p-1 transition-colors duration-300 ${
                isDark ? 'bg-teal-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`grid place-items-center w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isDark ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {isDark ? (
                  <Moon size={12} className="text-teal-700" />
                ) : (
                  <Sun size={12} className="text-amber-500" />
                )}
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="relative z-10 min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 pb-24 lg:pb-5">
        <div className="mx-auto max-w-7xl animate-fade-in">
          {children}
        </div>
      </main>
<div className="fixed bottom-24 right-4 z-50 lg:hidden">
  <button
    onClick={toggleDarkMode}
    className="flex h-14 w-14 items-center justify-center rounded-full glass-premium-card border border-white/30 dark:border-white/10 shadow-xl"
  >
    {isDark ? (
      <Moon size={22} className="text-teal-400" />
    ) : (
      <Sun size={22} className="text-amber-500" />
    )}
  </button>
</div>

      {/* Menú móvil */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/30 dark:border-white/10 liquid-navbar px-2 py-2 shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.15)] lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={`grid min-h-14 place-items-center rounded-2xl text-[11px] font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-teal-500/20 dark:text-teal-400 border border-teal-500/20'
                    : 'text-muted dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}