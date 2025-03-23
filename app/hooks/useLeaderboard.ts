import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  address: string
  characterName: string
  score: number
  timestamp: string
}

interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: { method: string; params: any[] }) => Promise<string>;
  };
}

declare const window: EthereumWindow;

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { address, isConnected } = useAccount()

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/submit-score')
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const submitScore = async (score: number, characterName: string = "Player") => {
    try {
      // Check if wallet is connected
      if (!isConnected || !address) {
        console.log('Wallet not connected')
        return false
      }

      // Create message to sign
      const message = `Submit score ${score} for Top Blast leaderboard`
      console.log('Requesting signature for message:', message)

      // Request signature
      const signature = await window.ethereum?.request({
        method: 'personal_sign',
        params: [message, address],
      })
      console.log('Received signature:', signature)

      // Submit score with signature
      const response = await fetch('/api/submit-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          characterName,
          score,
          signature,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit score')
      }

      // Refresh leaderboard after successful submission
      await fetchLeaderboard()
      return true
    } catch (error: any) {
      console.error('Error submitting score:', error)
      return false
    }
  }

  return {
    leaderboard,
    isLoading,
    submitScore,
    refreshLeaderboard: fetchLeaderboard,
  }
} 