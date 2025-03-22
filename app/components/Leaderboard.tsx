'use client';

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

interface LeaderboardEntry {
  id: number
  address: string
  characterName: string
  score: number
  timestamp: string
}

const formatScore = (score: number): string => {
  if (score >= 1000000000) {
    return `${(score / 1000000000).toFixed(2)}B`
  }
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(2)}M`
  }
  return score.toFixed(2)
}

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { address } = useAccount()

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/submit-score')
      const data = await response.json()
      setScores(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchScores()

    // Set up polling every 5 seconds
    const interval = setInterval(fetchScores, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  // Listen for score submission events
  useEffect(() => {
    const handleScoreSubmitted = () => {
      fetchScores()
    }

    window.addEventListener('scoreSubmitted', handleScoreSubmitted)
    return () => window.removeEventListener('scoreSubmitted', handleScoreSubmitted)
  }, [])

  const handleClick = (address: string) => {
    window.open(`https://snowscan.xyz/address/${address}`, '_blank')
  }

  if (loading) {
    return (
      <div style={{
        width: "100%",
        padding: "15px",
        textAlign: "center",
        fontSize: "1.2rem",
        fontWeight: "bold",
        color: "#19937f",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(8px)"
      }}>
        Loading scores...
      </div>
    )
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
      {scores.length === 0 ? (
        <div style={{
          padding: "15px",
          textAlign: "center",
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: "#19937f",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)"
        }}>
          No scores yet! Be the first to play!
        </div>
      ) : (
        scores.map((entry: LeaderboardEntry, index: number) => {
          const isUserScore = entry.address.toLowerCase() === address?.toLowerCase()
          const isTop3 = index < 3
          const isHighlighted = isUserScore && isTop3

          return (
            <div
              key={entry.id}
              onClick={() => handleClick(entry.address)}
              style={{
                position: "relative",
                overflow: "hidden",
                backgroundColor: isHighlighted ? "rgba(25, 147, 127, 0.2)" : "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                border: isHighlighted ? "2px solid #19937f" : "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                transform: isHighlighted ? "scale(1.02)" : "scale(1)",
                boxShadow: isHighlighted ? "0 0 15px rgba(25, 147, 127, 0.3)" : "none"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isHighlighted ? "rgba(25, 147, 127, 0.3)" : "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isHighlighted ? "rgba(25, 147, 127, 0.2)" : "rgba(255, 255, 255, 0.05)"}
            >
              {isTop3 && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.2,
                  backgroundColor: index === 0 ? "#EAB308" : 
                                 index === 1 ? "#9CA3AF" : 
                                 "#B45309"
                }} />
              )}
              
              <div style={{
                padding: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                zIndex: 1
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isTop3 && (
                    <span style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: index === 0 ? "#EAB308" : 
                             index === 1 ? "#9CA3AF" : 
                             "#B45309"
                    }}>
                      #{index + 1}
                    </span>
                  )}
                  <span style={{ 
                    fontWeight: isUserScore ? "bold" : "normal",
                    color: isUserScore ? "#19937f" : "#fff"
                  }}>
                    {entry.characterName || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                  </span>
                </div>
                <span style={{ 
                  fontWeight: "bold",
                  color: isUserScore ? "#19937f" : "#fff"
                }}>
                  {formatScore(entry.score)} <span style={{ fontSize: "0.8em" }}>MKT CAP</span>
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
} 