import { Calculator } from 'lucide-react';

export default function Login({ onSignIn }) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-5">
      <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-soft">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Contabilidad Profesional</h1>
            <p className="text-sm text-muted">Acceso seguro con Supabase Auth</p>
          </div>
        </div>
        <button
          onClick={onSignIn}
          className="h-12 w-full rounded-full bg-primary px-5 text-sm font-semibold text-white"
        >
          Continuar con Google
        </button>
      </section>
    </main>
  );
}
