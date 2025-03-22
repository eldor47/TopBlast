import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { avalanche } from 'wagmi/chains'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'db438e6711ca82ffa74a447916a8df10'

// 2. Create wagmiConfig
const metadata = {
  name: 'Top Blast',
  description: 'Top Blast Web3 Application',
  url: 'https://topblast.eldor.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [avalanche]
const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})

const queryClient = new QueryClient()

// 3. Create modal
createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': 1000,
  }
})

// 4. Create Web3Provider component
export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  )
} 