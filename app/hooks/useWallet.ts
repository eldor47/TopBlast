import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useRef, useCallback } from 'react'
import { useLeaderboard } from './useLeaderboard'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const { submitScore, refreshLeaderboard } = useLeaderboard()
  const isConnecting = useRef(false)
  const connectionQueue = useRef<(() => Promise<void>)[]>([])
  const connectionTimeout = useRef<NodeJS.Timeout | null>(null)
  const pendingScore = useRef<{ score: number; characterName: string } | null>(null)

  const processConnectionQueue = useCallback(async () => {
    if (connectionQueue.current.length === 0 || isConnecting.current) {
      return
    }

    const nextConnection = connectionQueue.current.shift()
    if (nextConnection) {
      await nextConnection()
    }
  }, [])

  const connectWallet = async () => {
    // If already connecting, queue this request
    if (isConnecting.current) {
      console.log('Queueing wallet connection request')
      connectionQueue.current.push(connectWallet)
      return
    }

    try {
      isConnecting.current = true
      
      // Clear any existing timeout
      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current)
      }

      // Add a small delay before opening the modal
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await open()
      
      // Store connection state
      localStorage.setItem('walletConnected', 'true')
      
      // Set a timeout to reset the connecting state
      connectionTimeout.current = setTimeout(() => {
        isConnecting.current = false
        connectionTimeout.current = null
        processConnectionQueue()
      }, 5000) // Reset after 5 seconds
      
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      localStorage.setItem('walletConnected', 'false')
      
      // If it's the specific error we're seeing, queue a retry
      if (error?.message?.includes('Already processing eth_requestAccounts')) {
        console.log('Queueing retry connection...')
        connectionQueue.current.push(connectWallet)
      } else {
        isConnecting.current = false
        processConnectionQueue()
      }
    }
  }

  const disconnectWallet = () => {
    disconnect()
    localStorage.setItem('walletConnected', 'false')
    isConnecting.current = false
    
    // Clear any pending timeout
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current)
      connectionTimeout.current = null
    }

    // Clear the connection queue
    connectionQueue.current = []
    
    // Clear any pending score
    pendingScore.current = null
  }

  // Function to store a pending score
  const storePendingScore = (score: number, characterName: string) => {
    console.log('Storing pending score:', { score, characterName })
    pendingScore.current = { score, characterName }
  }

  // Function to submit the pending score
  const submitPendingScore = async () => {
    if (!pendingScore.current) return null;

    try {
      const { score, characterName } = pendingScore.current
      console.log('Submitting pending score:', { score, characterName })
      const success = await submitScore(score, characterName)
      if (success) {
        console.log('Pending score submitted successfully')
        await refreshLeaderboard()
      } else {
        console.error('Failed to submit pending score')
      }
      return success
    } catch (error) {
      console.error('Error submitting pending score:', error)
      return false
    } finally {
      pendingScore.current = null
    }
  }

  return {
    address,
    isConnected,
    connectWallet,
    disconnect: disconnectWallet,
    storePendingScore,
    submitPendingScore,
    pendingScore: pendingScore.current
  }
} 