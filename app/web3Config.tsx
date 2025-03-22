import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'db438e6711ca82ffa74a447916a8df10'

// 2. Create wagmiConfig
const metadata = {
  name: 'Top Blast',
  description: 'Top Blast Web3 Application',
  url: 'https://topblast.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, sepolia]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
const queryClient = new QueryClient()

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

// 5. Create Web3Provider component
export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  )
} 