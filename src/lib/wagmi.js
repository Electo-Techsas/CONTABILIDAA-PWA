import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, polygon, bsc } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

// Puedes añadir más redes según necesites
const supportedChains = [mainnet, sepolia, polygon, bsc];

export const config = createConfig({
  chains: supportedChains,
  connectors: [
    metaMask(),
    walletConnect({
      projectId: 'TU_PROJECT_ID_DE_WALLETCONNECT', // Opcional, regístrate en walletconnect.com
      showQrModal: true,
    }),
  ],
  transport: http(),
});