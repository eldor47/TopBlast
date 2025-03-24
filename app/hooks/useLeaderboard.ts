import { useState, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useXAuth } from './useXAuth'

interface Score {
  id: number
  score: number
  characterName: string
  walletAddress?: string
  xUsername?: string
  timestamp: string
}

interface LeaderboardState {
  scores: Score[]
  isLoading: boolean
  error: string | null
}

interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: { method: string; params: any[] }) => Promise<string>;
  }
}

declare const window: EthereumWindow;

export function useLeaderboard() {
  const [state, setState] = useState<LeaderboardState>({
    scores: [],
    isLoading: false,
    error: null,
  })
  const { address, isConnected: isWalletConnected } = useAccount()
  const { signMessage } = useSignMessage()
  const { isConnected: isXConnected, username: xUsername } = useXAuth()

  const refreshLeaderboard = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const response = await fetch('/api/submit-score')
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      const data = await response.json()
      setState({ scores: data, isLoading: false, error: null })
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to load leaderboard' }))
    }
  }

  useEffect(() => {
    refreshLeaderboard()
  }, [])

  const submitScore = async (score: number, characterName?: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Validate score
      if (!score || typeof score !== 'number') {
        throw new Error('Invalid score')
      }

      // If connected with X, use X username
      const finalCharacterName = isXConnected ? xUsername : (characterName || 'Player')
      
      let body: any = {
        score,
        characterName: finalCharacterName,
        xUsername: isXConnected ? xUsername : undefined,
      }

      // If connected with wallet, add wallet authentication
      if (isWalletConnected && address && !isXConnected) {
        try {
          const message = `Submit score ${score} for ${finalCharacterName}`
          console.log('Requesting signature for message:', message)
          
          // Get the signature from the wallet
          const signature = await window.ethereum?.request({
            method: 'personal_sign',
            params: [message, address],
          })

          if (!signature) {
            throw new Error('Failed to get signature')
          }

          body = {
            ...body,
            walletAddress: address,
            signature,
            message,
          }
        } catch (signError) {
          console.error('Error signing message:', signError)
          throw new Error('Failed to sign message')
        }
      }

      console.log('Submitting score with body:', body)

      const response = await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Score submission failed:', errorData)
        throw new Error(errorData.error || 'Failed to submit score')
      }

      // Refresh the leaderboard after successful submission
      await refreshLeaderboard()
      
      // If connected with X, refresh again after a short delay to ensure the score is updated
      if (isXConnected) {
        setTimeout(async () => {
          await refreshLeaderboard()
        }, 1000)
      }

      return true
    } catch (error: any) {
      console.error('Error submitting score:', error)
      setState(prev => ({ ...prev, error: error.message || 'Failed to submit score' }))
      return false
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  return {
    ...state,
    submitScore,
    refreshLeaderboard,
  }
} 