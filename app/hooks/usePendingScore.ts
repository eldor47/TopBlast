import { useRef } from 'react'

interface PendingScore {
  score: number
  characterName: string
}

export function usePendingScore() {
  const pendingScore = useRef<PendingScore | null>(null)

  const storePendingScore = (score: number, characterName: string) => {
    pendingScore.current = { score, characterName }
  }

  const submitPendingScore = async () => {
    if (!pendingScore.current) return null
    const score = pendingScore.current
    pendingScore.current = null
    return score
  }

  return {
    pendingScore: pendingScore.current,
    storePendingScore,
    submitPendingScore,
  }
} 