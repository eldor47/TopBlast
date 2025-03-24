'use client';

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useLeaderboard } from '../hooks/useLeaderboard'

interface LeaderboardEntry {
  id: number
  score: number
  characterName: string
  walletAddress?: string
  xUsername?: string
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
  const { scores, isLoading, error } = useLeaderboard()
  const { address } = useAccount()

  if (isLoading) {
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

  if (error) {
    return (
      <div style={{
        width: "100%",
        padding: "15px",
        textAlign: "center",
        fontSize: "1.2rem",
        fontWeight: "bold",
        color: "#ff4444",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(8px)"
      }}>
        Error: {error}
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
          const isUserScore = entry.walletAddress?.toLowerCase() === address?.toLowerCase()
          const isTop3 = index < 3
          const isHighlighted = isUserScore && isTop3

          return (
            <div
              key={entry.id}
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
                    {entry.xUsername ? (
                      <a
                        href={`https://x.com/${entry.xUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1DA1F2', textDecoration: 'none' }}
                      >
                        @{entry.xUsername}
                      </a>
                    ) : entry.walletAddress ? (
                      <a
                        href={`https://snowtrace.io/address/${entry.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#19937f', textDecoration: 'none' }}
                      >
                        {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                      </a>
                    ) : (
                      entry.characterName
                    )}
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