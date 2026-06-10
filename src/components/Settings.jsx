import { AlertTriangle, Tag, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Settings({ onClearAll }) {
  const { user } = useAuth();
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState('');

  const handleClearAll = async () => {
    const confirmFirst = window.confirm('¿Seguro, Ale? Esto borrará TODO tu historial de transacciones de Supabase de forma irreversible.');
    if (!confirmFirst) return;

    const confirmSecond = window.confirm('¿Última palabra? No hay marcha atrás.');
    if (!confirmSecond) return;

    try {
      setClearing(true);
      setMessage('');
      await onClearAll();
      setMessage('Historial borrado con éxito.');
    } catch (err) {
      setMessage('Error al intentar borrar los datos.');
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <section className="space-y-5 animate-fade-in">
      {/* Perfil de Usuario */}
      <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Perfil de Usuario</h2>
            <p className="text-sm text-muted">Sesión activa de Supabase</p>
          </div>
        </div>
        <div className="rounded-2xl bg-surface p-4 border border-black/[0.03]">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Correo Electrónico</p>
          <p className="text-base font-bold text-ink">{user?.email || 'No disponible'}</p>
        </div>
      </article>

      {/* Gestión de Categorías */}
      <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">
            <Tag size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Gestión de Categorías</h2>
            <p className="text-sm text-muted">Administra tus etiquetas de gastos e ingresos</p>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-black/10 p-5 text-center">
          <p className="text-sm text-muted mb-3">Las categorías personalizadas se sincronizarán de forma automática.</p>
          <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-white shadow-md shadow-primary/20 transition-all opacity-80 cursor-not-allowed">
            Próximamente disponible
          </button>
        </div>
      </article>

      {/* Danger Zone */}
      <article className="rounded-3xl border border-negative/20 bg-negative/[0.02] p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-negative/10 text-negative">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-negative">Zona de Peligro (Danger Zone)</h2>
            <p className="text-sm text-muted">Acciones destructivas irreversibles</p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 rounded-xl p-3 text-sm font-medium ${message.includes('éxito') ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
            {message}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div>
            <h4 className="text-sm font-semibold text-ink">Borrado de Emergencia</h4>
            <p className="text-xs text-muted">Limpia por completo la tabla de transacciones vinculada a tu cuenta.</p>
          </div>
          <button
            type="button"
            disabled={clearing}
            onClick={handleClearAll}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-negative hover:bg-negative/90 px-4 text-xs font-semibold text-white shadow-md shadow-negative/20 transition-all disabled:opacity-50"
          >
            <Trash2 size={14} />
            {clearing ? 'Borrando...' : 'Borrar todo el historial'}
          </button>
        </div>
      </article>
    </section>
  );
}