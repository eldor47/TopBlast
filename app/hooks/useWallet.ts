import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useRef } from 'react'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const isConnecting = useRef(false)

  const connectWallet = async () => {
    if (isConnecting.current) return
    isConnecting.current = true
    try {
      await open()
    } finally {
      isConnecting.current = false
    }
  }

  return {
    address,
    isConnected,
    connectWallet,
    disconnect,
  }
} 