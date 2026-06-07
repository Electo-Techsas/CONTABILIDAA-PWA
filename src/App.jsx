import { useMemo, useState } from 'react';
import { LogOut, Plus } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ExcelTools from './components/ExcelTools';
import Layout from './components/Layout';
import Login from './components/Login';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { DEFAULT_CATEGORIES } from './lib/schema';
import { hasSupabaseConfig } from './lib/supabase';

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const {
    transactions,
    filteredTransactions,
    filters,
    setFilters,
    loading,
    createTransaction,
    updateTransaction,
    removeTransaction,
    importTransactions
  } = useTransactions(user?.id);

  const categories = useMemo(() => {
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...transactions.map((item) => item.category)])).sort();
  }, [transactions]);

  if (!hasSupabaseConfig) {
    return <MissingSupabaseConfig />;
  }

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center bg-surface text-muted">Cargando...</div>;
  }

  if (!user) {
    return <Login onSignIn={signIn} />;
  }

  const openNewForm = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEditForm = (transaction) => {
    setEditing(transaction);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    if (editing) {
      await updateTransaction(editing.id, values);
    } else {
      await createTransaction(values);
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <Layout active="dashboard">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Contabilidad PWA</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Panel financiero</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openNewForm}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white shadow-soft"
          >
            <Plus size={18} />
            Nueva transaccion
          </button>
          <button
            onClick={signOut}
            className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white text-muted"
            title="Cerrar sesion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="space-y-5 pb-24 lg:pb-8">
        <Dashboard transactions={filteredTransactions} loading={loading} />

        <ExcelTools
          transactions={filteredTransactions}
          onImport={importTransactions}
        />

        <TransactionHistory
          transactions={filteredTransactions}
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          onEdit={openEditForm}
          onDelete={removeTransaction}
        />
      </main>

      {formOpen && (
        <TransactionForm
          transaction={editing}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}
    </Layout>
  );
}

function MissingSupabaseConfig() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-5">
      <section className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-primary">Configuracion pendiente</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Faltan las variables de Supabase</h1>
        <p className="mt-3 text-sm text-muted">
          Crea un archivo .env en la raiz del proyecto y reinicia el servidor de Vite.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/[0.04] p-4 text-sm text-ink">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_public_key

Tambien puedes usar:
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key`}
        </pre>
      </section>
    </main>
  );
}
