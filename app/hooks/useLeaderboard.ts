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
  const { signMessage, data: signatureData, isSuccess: isSignatureSuccess } = useSignMessage()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingScore, setPendingScore] = useState<{ score: number; characterName: string } | null>(null)

  // Fetch leaderboard
  useEffect(() => {
    fetchLeaderboard()
  }, [])

  // Handle signature success
  useEffect(() => {
    if (isSignatureSuccess && signatureData && pendingScore) {
      submitScoreWithSignature(pendingScore.score, pendingScore.characterName, signatureData)
      setPendingScore(null)
    }
  }, [isSignatureSuccess, signatureData])

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

  const submitScoreWithSignature = async (score: number, characterName: string, signature: string) => {
    try {
      // Submit score with signature
      const response = await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          score,
          message: `Submit score ${score} for Top Blast leaderboard`,
          signature,
          characterName
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Score submission failed:', data.error || 'Unknown error')
        throw new Error(data.error || 'Failed to submit score')
      }

      console.log('Score submitted successfully:', data)
      
      // Refresh leaderboard immediately after successful submission
      await fetchLeaderboard()
      // Dispatch event to notify components
      window.dispatchEvent(new Event('scoreSubmitted'))
      return true
    } catch (error: any) {
      console.error('Error submitting score:', error)
      // Log more details about the error
      if (error.message) console.error('Error message:', error.message)
      if (error.stack) console.error('Error stack:', error.stack)
      return false
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
      console.log('Requesting signature for message:', message)
      
      // Store the score and character name for later use
      setPendingScore({ score, characterName })
      
      // Request signature
      signMessage({ message })
      
      return true
    } catch (error: any) {
      console.error('Error requesting signature:', error)
      if (error.message) console.error('Error message:', error.message)
      if (error.stack) console.error('Error stack:', error.stack)
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