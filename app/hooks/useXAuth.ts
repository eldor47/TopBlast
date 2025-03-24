import { useState, useEffect } from 'react'

interface XAuthState {
  isConnected: boolean
  username: string | null
  profileImage: string | null
}

export function useXAuth() {
  const [state, setState] = useState<XAuthState>({
    isConnected: false,
    username: null,
    profileImage: null,
  })

  useEffect(() => {
    // Check if we have stored X auth data
    const storedUsername = sessionStorage.getItem('x_username')
    const storedProfileImage = sessionStorage.getItem('x_profile_image')
    if (storedUsername && storedProfileImage) {
      setState({
        isConnected: true,
        username: storedUsername,
        profileImage: storedProfileImage,
      })
    }

    // Listen for X auth success message
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return
      if (event.data.type === 'X_AUTH_SUCCESS') {
        const { username, profileImage } = event.data
        sessionStorage.setItem('x_username', username)
        sessionStorage.setItem('x_profile_image', profileImage)
        setState({
          isConnected: true,
          username,
          profileImage,
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const connect = async () => {
    try {
      const state = generateState()
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      // Set code verifier as a cookie with proper settings
      document.cookie = `x_code_verifier=${codeVerifier}; path=/; SameSite=Lax; Secure`

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_X_CLIENT_ID!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`,
        scope: 'tweet.read users.read',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      })

      const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
      window.open(authUrl, 'X Auth', 'width=600,height=600')
    } catch (error) {
      console.error('Failed to connect with X:', error)
      throw error
    }
  }

  const disconnect = () => {
    sessionStorage.removeItem('x_username')
    sessionStorage.removeItem('x_profile_image')
    // Remove the code verifier cookie
    document.cookie = 'x_code_verifier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setState({
      isConnected: false,
      username: null,
      profileImage: null,
    })
  }

  return {
    ...state,
    connect,
    disconnect,
  }
}

// Helper functions for PKCE
function generateState(): string {
  return Math.random().toString(36).substring(2, 15)
}

function generateCodeVerifier(): string {
  return base64URLEncode(crypto.getRandomValues(new Uint8Array(32)))
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64URLEncode(new Uint8Array(hash))
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
} 