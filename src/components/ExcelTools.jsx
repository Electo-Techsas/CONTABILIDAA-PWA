import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { exportTransactionsToExcel, readTransactionsFromExcel } from '../lib/excel';

export default function ExcelTools({ transactions, onImport }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState('');

  const importFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('Validando archivo...');
    const result = await readTransactionsFromExcel(file);
    if (result.errors.length) {
      setStatus(result.errors.slice(0, 4).join(' '));
      event.target.value = '';
      return;
    }

    const summary = await onImport(result.transactions);
    setStatus(`Importadas: ${summary.imported}. Duplicadas omitidas: ${summary.skipped}.`);
    event.target.value = '';
  };

  return (
    <section id="excel" className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-ink">Importacion y exportacion Excel</h2>
        <p className="text-sm text-muted">Columnas requeridas: Monto, Tipo, Categoria, Fecha, Descripcion</p>
        {status && <p className="mt-2 text-sm font-medium text-primary">{status}</p>}
      </div>
      <div className="flex gap-2">
        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={importFile} className="hidden" />
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-black/10 px-4 text-sm font-semibold text-ink"
        >
          <Upload size={18} />
          Importar
        </button>
        <button
          onClick={() => exportTransactionsToExcel(transactions)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white"
        >
          <Download size={18} />
          Exportar
        </button>
      </div>
    </section>
  );
}
