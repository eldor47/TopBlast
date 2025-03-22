// API Route for Next.js (pages/api/submit-score.ts)
import { NextResponse } from 'next/server'
import { verifyMessage } from 'viem'
import { avalanche } from 'wagmi/chains'
import { createLeaderboardTable, insertScore, getTopScores } from '@/app/lib/db'

// Initialize the database table
createLeaderboardTable().catch(console.error)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received score submission:', body)

    // Validate required fields
    const { address, characterName, score, signature, message } = body
    if (!address || !score || !signature || !message) {
      console.error('Missing required fields:', { address, score, signature, message })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate score is a number
    if (typeof score !== 'number' || isNaN(score)) {
      console.error('Invalid score:', score)
      return NextResponse.json(
        { error: 'Invalid score format' },
        { status: 400 }
      )
    }

    // Skip signature verification in development
    const isValid = process.env.NODE_ENV === 'development' || await verifyMessage({
      address,
      message,
      signature
    })

    if (!isValid) {
      console.error('Invalid signature for address:', address)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Validate character name
    if (!characterName || typeof characterName !== 'string' || characterName.length > 50) {
      console.error('Invalid character name:', characterName)
      return NextResponse.json(
        { error: 'Invalid character name' },
        { status: 400 }
      )
    }

    // Add score to database
    await insertScore(address, characterName, score)
    console.log('Score inserted successfully for address:', address)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error submitting score:', error)
    // Log more details about the error
    if (error.message) console.error('Error message:', error.message)
    if (error.stack) console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to submit score' },
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