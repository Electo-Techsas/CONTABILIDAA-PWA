import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_PREFIX = 'finance-section-open:';

export default function CollapsibleSection({ id, title, subtitle, icon: Icon, actions, className = '', children, defaultOpen = true }) {
  const [open, setOpen] = useState(() => {
    try {
      const saved = window.localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      return saved === null ? defaultOpen : saved === 'true';
    } catch {
      return defaultOpen;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, String(open));
  }, [id, open]);

  return (
    <article className={`glass-premium-card rounded-[28px] p-5 ${className}`}>
      <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap sm:items-center sm:gap-3">
        {Icon && <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400"><Icon size={19} /></div>}
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <h2 className="text-base font-semibold text-ink dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-muted dark:text-slate-400">{subtitle}</p>}
        </button>
        <button type="button" onClick={() => setOpen((current) => !current)} aria-label={`${open ? 'Plegar' : 'Desplegar'} ${title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/30 text-ink transition-transform dark:bg-white/10 dark:text-white">
          <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {actions && <div className="order-last flex w-full flex-wrap gap-2 pl-12 sm:order-none sm:w-auto sm:shrink-0 sm:justify-end sm:pl-0">{actions}</div>}
      </div>
      {open && <div className="mt-4">{children}</div>}
    </article>
  );
}
