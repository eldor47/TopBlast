"use client";

import { useWallet } from '../hooks/useWallet'
import { useXAuth } from '../hooks/useXAuth'
import { useState } from 'react'
import Modal from './Modal'

interface WalletButtonProps {
  onConnect?: () => void;
}

export default function WalletButton({ onConnect }: WalletButtonProps) {
  const { isConnected, connectWallet, disconnect } = useWallet()
  const { isConnected: isXConnected, username: xUsername, connect: connectX, disconnect: disconnectX } = useXAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleConnect = async () => {
    if (onConnect) {
      onConnect()
    } else {
      try {
        await connectWallet()
        setShowAuthModal(false)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }

  const handleConnectX = async () => {
    if (onConnect) {
      onConnect()
    } else {
      try {
        await connectX()
        setShowAuthModal(false)
      } catch (error) {
        console.error('Failed to connect with X:', error)
      }
    }
  }

  const handleDisconnect = async () => {
    if (isConnected) {
      await disconnect()
    }
    if (isXConnected) {
      await disconnectX()
    }
  }

  // Don't show the button if connected with X
  if (isXConnected) {
    return null;
  }

  return (
    <>
      {!isConnected ? (
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            padding: '10px 15px',
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
          Connect
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          style={{
            padding: '10px 15px',
            fontSize: '1rem',
            backgroundColor: '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Disconnect
        </button>
      )}

      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Connect Wallet"
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