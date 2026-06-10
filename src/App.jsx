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
import Settings from './components/Settings';
import { DEFAULT_CATEGORIES } from './lib/schema';
import { hasSupabaseConfig } from './lib/supabase';

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');

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
    return <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">Cargando...</div>;
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

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Panel financiero';
      case 'charts': return 'Gráficos detallados';
      case 'history': return 'Historial de movimientos';
      case 'excel': return 'Importación y exportación';
      case 'settings': return 'Ajustes del sistema';
      default: return 'Panel financiero';
    }
  };

  return (
    <Layout active={activeTab} setActive={setActiveTab}>
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <p className="text-sm font-bold text-teal-600 dark:text-teal-400 tracking-wide">Contabilidad PWA</p>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl tracking-tight">
            {getTitle()}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openNewForm}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 px-4 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all"
          >
            <Plus size={18} />
            Nueva transaccion
          </button>
          <button
            onClick={signOut}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/30 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-sm"
            title="Cerrar sesion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="space-y-5 pb-24 lg:pb-8 animate-fade-in">
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            transactions={filteredTransactions} 
            allTransactions={transactions} 
            loading={loading} 
          />
        )}

        {activeTab === 'excel' && (
          <ExcelTools
            transactions={filteredTransactions}
            onImport={importTransactions}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistory
            transactions={filteredTransactions}
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            onEdit={openEditForm}
            onDelete={removeTransaction}
          />
        )}

        {/* Solucionado: Ahora renderiza los mismos gráficos del Dashboard pero limpios */}
        {activeTab === 'charts' && (
          <Dashboard 
            transactions={filteredTransactions} 
            allTransactions={transactions} 
            loading={loading} 
            onlyCharts={true} 
          />
        )}

        {activeTab === 'settings' && (
  <Settings
    onClearAll={async () => {
      const confirmed = window.confirm(
        '¿Deseas eliminar todas las transacciones?'
      );

      if (!confirmed) return;

      for (const transaction of transactions) {
        await removeTransaction(transaction.id);
      }
    }}
  />
)}
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
    <main className="grid min-h-screen place-items-center bg-gradient-to-tr from-slate-100 via-blue-50 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-5">
      <section className="w-full max-w-2xl rounded-3xl border border-white/30 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl">
        <p className="text-sm font-bold text-teal-600 dark:text-teal-400">Configuracion pendiente</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">Faltan las variables de Supabase</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Crea un archivo .env en la raiz del proyecto y reinicia el servidor de Vite.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-white/50 dark:bg-black/20 p-4 text-sm text-slate-800 dark:text-slate-200 border border-white/40 dark:border-white/5">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_public_key

Tambien puedes usar:
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key`}
        </pre>
      </section>
    </main>
  );
}