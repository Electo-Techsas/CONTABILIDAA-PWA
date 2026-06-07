import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildImportHash } from '../lib/excel';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

function cleanTransaction(input) {
  return {
    amount: Number(input.amount),
    type: input.type,
    category: input.category,
    date: input.date,
    description: input.description?.trim() ?? '',
    paymentMethod: input.paymentMethod || 'Otro'
  };
}

function toDbTransaction(input, uid) {
  const payload = cleanTransaction(input);
  return {
    user_id: uid,
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    date: payload.date,
    description: payload.description,
    payment_method: payload.paymentMethod,
    import_hash: input.importHash || buildImportHash(payload),
    updated_at: new Date().toISOString()
  };
}

function fromDbTransaction(row) {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
    description: row.description || '',
    paymentMethod: row.payment_method || 'Otro',
    importHash: row.import_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function useTransactions(uid) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'Todos', category: 'Todas', from: '', to: '' });

  const refreshTransactions = useCallback(async () => {
    if (!uid || !hasSupabaseConfig) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setTransactions([]);
    } else {
      setTransactions((data || []).map(fromDbTransaction));
    }
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    if (!uid || !hasSupabaseConfig) return undefined;

    refreshTransactions();

    const channel = supabase
      .channel(`transactions-${uid}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${uid}` },
        refreshTransactions
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, refreshTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const typeMatch = filters.type === 'Todos' || item.type === filters.type;
      const categoryMatch = filters.category === 'Todas' || item.category === filters.category;
      const fromMatch = !filters.from || item.date >= filters.from;
      const toMatch = !filters.to || item.date <= filters.to;
      return typeMatch && categoryMatch && fromMatch && toMatch;
    });
  }, [transactions, filters]);

  async function createTransaction(input) {
    if (!hasSupabaseConfig) return;
    const { error } = await supabase.from('transactions').insert(toDbTransaction(input, uid));
    if (error) throw error;
    await refreshTransactions();
  }

  async function updateTransaction(id, input) {
    if (!hasSupabaseConfig) return;
    const { error } = await supabase
      .from('transactions')
      .update(toDbTransaction(input, uid))
      .eq('id', id)
      .eq('user_id', uid);
    if (error) throw error;
    await refreshTransactions();
  }

  async function removeTransaction(id) {
    if (!hasSupabaseConfig) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', uid);
    if (error) throw error;
    await refreshTransactions();
  }

  async function importTransactions(items) {
    if (!hasSupabaseConfig) return { imported: 0, skipped: 0 };
    if (!items.length) return { imported: 0, skipped: 0 };

    const hashes = items.map((item) => item.importHash).filter(Boolean);
    const { data: existing, error: existingError } = await supabase
      .from('transactions')
      .select('import_hash')
      .eq('user_id', uid)
      .in('import_hash', hashes);

    if (existingError) throw existingError;

    const existingHashes = new Set((existing || []).map((item) => item.import_hash));
    const newItems = items
      .filter((item) => !existingHashes.has(item.importHash))
      .map((item) => toDbTransaction(item, uid));

    if (newItems.length) {
      const { error } = await supabase.from('transactions').insert(newItems);
      if (error) throw error;
    }

    await refreshTransactions();
    return { imported: newItems.length, skipped: items.length - newItems.length };
  }

  return {
    transactions,
    filteredTransactions,
    filters,
    setFilters,
    loading,
    createTransaction,
    updateTransaction,
    removeTransaction,
    importTransactions,
    refreshTransactions
  };
}
