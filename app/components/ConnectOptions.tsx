"use client";

import { useWallet } from '../hooks/useWallet'
import { useXAuth } from '../hooks/useXAuth'
import { useState, useEffect } from 'react'
import Modal from './Modal'

interface ConnectOptionsProps {
  onScoreSubmit: () => void;
}

export default function ConnectOptions({ onScoreSubmit }: ConnectOptionsProps) {
  const { connectWallet } = useWallet()
  const { connect: connectX, isConnected: isXConnected } = useXAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Auto-submit score when connected with X
  useEffect(() => {
    if (isXConnected) {
      onScoreSubmit()
    }
  }, [isXConnected, onScoreSubmit])

  const handleConnect = async () => {
    try {
      await connectWallet()
      setShowAuthModal(false)
      onScoreSubmit()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleConnectX = async () => {
    try {
      await connectX()
      setShowAuthModal(false)
    } catch (error) {
      console.error('Failed to connect with X:', error)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        style={{
          padding: '12px 24px',
          fontSize: '1rem',
          backgroundColor: '#19937f',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0px 0px 10px rgba(25, 147, 127, 0.5)',
          width: '100%',
          maxWidth: '200px',
        }}
      >
        Connect to Submit Score
      </button>

      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Connect to Submit Score"
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px' }}>
            Choose how you want to connect:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleConnect}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: '#19937f',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0px 0px 10px rgba(25, 147, 127, 0.5)',
              }}
            >
              Connect with MetaMask
            </button>
            <button
              onClick={handleConnectX}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: '#000000',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0px 0px 10px rgba(29, 161, 242, 0.5)',
              }}
            >
              Connect with X
            </button>
          </div>
          <p
            style={{
              marginTop: '15px',
              fontSize: '0.9rem',
              color: '#666',
            }}
          >
            You can still play without connecting
          </p>
        </div>
      </Modal>
    </>
  )
} 