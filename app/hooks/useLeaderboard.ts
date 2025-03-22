import { useAccount, useSignMessage } from 'wagmi'
import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  address: string
  score: number
  timestamp: number
  characterName: string
}

export function useLeaderboard() {
  const { address, isConnected } = useAccount()
  const { signMessage } = useSignMessage()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch leaderboard
  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/submit-score')
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitScore = async (score: number, characterName: string = "Player") => {
    if (!isConnected || !address) {
      console.error('Wallet not connected')
      return false
    }

    setIsLoading(true)
    try {
      // Create a message to sign
      const message = `Submit score ${score} for Top Blast leaderboard`
      const signature = await signMessage({ message })

      // Submit score with signature
      const response = await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          score,
          message,
          signature,
          characterName
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit score')
      }

      // Refresh leaderboard immediately after successful submission
      await fetchLeaderboard()
      // Dispatch event to notify components
      window.dispatchEvent(new Event('scoreSubmitted'))
      return true
    } catch (error) {
      console.error('Error submitting score:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    leaderboard,
    isLoading,
    submitScore,
    refreshLeaderboard: fetchLeaderboard
  }
} 