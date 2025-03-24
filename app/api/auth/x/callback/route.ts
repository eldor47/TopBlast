import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      console.error('Missing parameters:', { code, state })
      return new NextResponse('Missing required parameters', { status: 400 })
    }

    // Log environment variables (without exposing secrets)
    console.log('Environment check:', {
      hasClientId: !!process.env.NEXT_PUBLIC_X_CLIENT_ID,
      hasClientSecret: !!process.env.X_CLIENT_SECRET,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL
    })

    // Get code verifier from cookie
    const cookieStore = await cookies()
    const codeVerifier = cookieStore.get('x_code_verifier')?.value

    if (!codeVerifier) {
      console.error('Missing code verifier')
      return new NextResponse('Missing code verifier', { status: 400 })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`,
        code_verifier: codeVerifier,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response:', { 
      success: !!tokenData.access_token,
      error: tokenData.error,
      error_description: tokenData.error_description
    })

    if (!tokenData.access_token) {
      throw new Error(`Failed to get access token: ${tokenData.error_description || 'Unknown error'}`)
    }

    // Get user profile
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()
    console.log('User data response:', { 
      success: !!userData.data,
      error: userData.error,
      error_description: userData.error_description
    })

    // Return HTML that posts message to parent window and closes the popup
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'X_AUTH_SUCCESS',
              username: '${userData.data.username}',
              profileImage: '${userData.data.profile_image_url}'
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error('X auth callback error:', error)
    return new NextResponse('Authentication failed', { status: 500 })
  }
} 