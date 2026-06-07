# Contabilidad PWA

Base profesional mobile-first para una aplicacion contable con React, Vite, Tailwind, Supabase Auth, Supabase Postgres, Recharts y SheetJS.

## Stack elegido

React + Vite es la opcion recomendada para esta PWA porque ofrece gran rendimiento en navegador, build liviano, excelente ecosistema, soporte directo para Supabase y una integracion sencilla con Tailwind, Recharts y SheetJS.

## Instalacion

```bash
npm install
copy .env.example .env
npm run dev
```

Completa `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_public_key
```

Si Supabase te muestra `publishable key` en lugar de `anon public key`, tambien puedes usar:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
```

Las encuentras en Supabase:

```txt
Project Settings > API > Project URL
Project Settings > API > anon public key o publishable key
```

## Supabase

Ya que creaste la tabla `transactions`, revisa que tenga esta forma:

```sql
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null,
  type text not null check (type in ('Ingreso', 'Egreso')),
  category text not null,
  date date not null,
  description text default '',
  payment_method text default 'Otro',
  import_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, import_hash)
);
```

Tambien deje el SQL completo en:

```txt
supabase-schema.sql
```

## Auth con Google

En Supabase activa:

```txt
Authentication > Providers > Google
```

En Google Cloud OAuth configura estas URLs:

```txt
Authorized JavaScript origins:
http://localhost:5173
https://tu-dominio.com

Authorized redirect URIs:
https://tu-proyecto.supabase.co/auth/v1/callback
```

En Supabase agrega:

```txt
Authentication > URL Configuration > Site URL:
http://localhost:5173

Authentication > URL Configuration > Redirect URLs:
http://localhost:5173
https://tu-dominio.com
```

## Realtime

Para que los cambios lleguen en vivo, activa Realtime para la tabla:

```txt
Database > Replication > Tables > transactions
```

Si Realtime no esta activo, la app igual actualiza despues de crear, editar o eliminar porque vuelve a consultar cuando recibe eventos disponibles.

## Excel

Columnas requeridas para importar:

- Monto
- Tipo
- Categoria
- Fecha
- Descripcion

Columnas opcionales:

- Metodo de pago
- Metodo

El importador genera `import_hash` para evitar duplicar registros importados previamente.

## Deploy en Vercel

Configuracion recomendada:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Variables de entorno en Vercel:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
```

Despues del deploy, agrega tu dominio publico en Supabase:

```txt
Authentication > URL Configuration > Site URL:
https://tu-dominio.com

Authentication > URL Configuration > Redirect URLs:
https://tu-dominio.com
```

Si usas el dominio temporal de Vercel antes de conectar tu dominio:

```txt
https://tu-app.vercel.app
```

## Estructura

```txt
src/
  components/
    Dashboard.jsx
    ExcelTools.jsx
    Layout.jsx
    Login.jsx
    TransactionForm.jsx
    TransactionHistory.jsx
  hooks/
    useAuth.js
    useTransactions.js
  lib/
    excel.js
    schema.js
    supabase.js
  App.jsx
  main.jsx
  styles.css
```
