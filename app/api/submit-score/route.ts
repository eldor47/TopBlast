// API Route for Next.js (pages/api/submit-score.ts)
import { NextResponse } from 'next/server'
import { verifyMessage } from 'viem'
import { avalanche } from 'wagmi/chains'
import { createLeaderboardTable, insertScore, getTopScores } from '@/app/lib/db'

// Initialize the database table
createLeaderboardTable().catch(console.error)

export async function POST(request: Request) {
  try {
    const { address, characterName, score, signature, message } = await request.json()

    // Skip signature verification in development
    const isValid = process.env.NODE_ENV === 'development' || await verifyMessage({
      address,
      message,
      signature
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Validate character name
    if (!characterName || typeof characterName !== 'string' || characterName.length > 50) {
      return NextResponse.json(
        { error: 'Invalid character name' },
        { status: 400 }
      )
    }

    // Add score to database
    await insertScore(address, characterName, score)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting score:', error)
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const scores = await getTopScores()
    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}