import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useEffect } from 'react'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  // Auto-connect on load if previously connected
  useEffect(() => {
    let mounted = true

    const checkAndConnect = async () => {
      try {
        // Wait for a short delay to ensure Web3Modal is ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!mounted) return

        // Check if there's a previously connected wallet
        const previouslyConnected = localStorage.getItem('walletConnected')
        if (previouslyConnected === 'true' && !isConnected) {
          console.log('Attempting to auto-connect wallet...')
          await open()
        }
      } catch (error) {
        console.error('Failed to auto-connect wallet:', error)
        if (mounted) {
          localStorage.setItem('walletConnected', 'false')
        }
      }
    }

    checkAndConnect()

    return () => {
      mounted = false
    }
  }, [open, isConnected])

  const connectWallet = async () => {
    try {
      await open()
      // Store connection state
      localStorage.setItem('walletConnected', 'true')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      localStorage.setItem('walletConnected', 'false')
    }
  }

  const disconnectWallet = () => {
    disconnect()
    localStorage.setItem('walletConnected', 'false')
  }

  return {
    address,
    isConnected,
    connectWallet,
    disconnect: disconnectWallet
  }
} 