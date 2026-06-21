import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ethers } from 'ethers';

const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;

export default function WalletImporter({ onImport }) {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState({});

  useEffect(() => {
    if (address && isConnected) {
      fetchTransactions(address);
    } else {
      setTransactions([]);
      setSelectedTx({});
    }
  }, [address, isConnected]);

  const fetchTransactions = async (walletAddress) => {
    setLoading(true);
    try {
      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === '1') {
        const txs = data.result.map(tx => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString().slice(0,10),
          isIncome: tx.to.toLowerCase() === walletAddress.toLowerCase(),
          amount: parseFloat(ethers.formatEther(tx.value)),
        }));
        setTransactions(txs);
      } else {
        console.error('Error Etherscan:', data.message);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (hash) => {
    setSelectedTx(prev => ({ ...prev, [hash]: !prev[hash] }));
  };

  const handleImportSelected = async () => {
    const selected = transactions.filter(tx => selectedTx[tx.hash]);
    for (const tx of selected) {
      const tipo = tx.isIncome ? 'Ingreso' : 'Egreso';
      const transactionData = {
        date: tx.timestamp,
        type: tipo,
        category: 'Criptomonedas',
        description: `Transacción ETH: ${tx.hash.slice(0,10)}...`,
        amount: tx.amount.toString(),
        paymentMethod: 'Wallet (ETH)',
      };
      await onImport(transactionData);
    }
    setSelectedTx({});
    setTransactions([]);
  };

  // Estado: no conectado
  if (!isConnected) {
    console.log('Connectors disponibles:', connectors);
    return (
      <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-md p-4">
        <h3 className="text-lg font-semibold mb-2">Importar desde Wallet</h3>
        
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => {
              console.log('Intentando conectar con', connector.name);
              connect({ connector });
            }}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl mr-2"
          >
            Conectar {connector.name}
          </button>
        ))}
        
        {/* Botón de prueba con MetaMask nativo */}
        <button
          onClick={async () => {
            if (!window.ethereum) {
              alert('MetaMask no está instalada o no está inyectada');
              return;
            }
            try {
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
              console.log('Cuentas:', accounts);
              alert('Conectado a ' + accounts[0]);
            } catch (err) {
              console.error(err);
              alert('Error: ' + err.message);
            }
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded-xl"
        >
          Probar MetaMask nativo
        </button>
      </div>
    );
  }

  // Estado: conectado
  return (
    <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Wallet: {address.slice(0,6)}...{address.slice(-4)}</h3>
        <button onClick={disconnect} className="text-red-500 text-sm">Desconectar</button>
      </div>
      {loading ? (
        <p>Cargando transacciones...</p>
      ) : (
        <>
          <div className="max-h-80 overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.hash} className="border-b py-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!selectedTx[tx.hash]}
                  onChange={() => handleToggleSelect(tx.hash)}
                />
                <div className="flex-1">
                  <p className="text-sm">
                    {tx.isIncome ? '📥 Recibido' : '📤 Enviado'} - {tx.amount} ETH
                  </p>
                  <p className="text-xs text-gray-500">{tx.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleImportSelected}
            disabled={!Object.values(selectedTx).some(v => v)}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-xl w-full"
          >
            Importar seleccionadas
          </button>
        </>
      )}
    </div>
  );
}