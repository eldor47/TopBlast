// API Route for Next.js (pages/api/submit-score.ts)
import { NextResponse } from 'next/server'
import { verifyMessage } from 'viem'
import { createLeaderboardTable, insertScore, getTopScores } from '@/app/lib/db'

// Initialize the database table
createLeaderboardTable().catch(console.error)

export async function GET() {
  try {
    const scores = await getTopScores()
    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received score submission:', body)

    const { score, characterName, signature, message, xUsername, walletAddress } = body

    // Validate required fields
    if (!score || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      )
    }

    if (!characterName) {
      return NextResponse.json(
        { error: 'Character name is required' },
        { status: 400 }
      )
    }

    let address: string | undefined
    let verifiedUsername: string | undefined

    // Handle wallet authentication
    if (signature && message && walletAddress) {
      try {
        const isValid = await verifyMessage({
          message,
          signature,
          address: walletAddress,
        })
        if (isValid) {
          address = walletAddress
        } else {
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          )
        }
      } catch (error) {
        console.error('Signature verification failed:', error)
        return NextResponse.json(
          { error: 'Signature verification failed' },
          { status: 401 }
        )
      }
    }
    // Handle X authentication
    else if (xUsername) {
      verifiedUsername = xUsername
    } else {
      return NextResponse.json(
        { error: 'No authentication provided' },
        { status: 401 }
      )
    }

    const entry = await insertScore(
      address,
      characterName,
      score,
      verifiedUsername
    )

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error submitting score:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit score' },
      { status: 500 }
    )
  }
}