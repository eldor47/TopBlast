"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { Web3Provider } from "./web3Config";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { useWallet } from "./hooks/useWallet";
import { usePendingScore } from "./hooks/usePendingScore";
import Leaderboard from "./components/Leaderboard";
import Modal from './components/Modal';
import Snackbar from './components/Snackbar'
import { useXAuth } from './hooks/useXAuth'
import ConnectOptions from './components/ConnectOptions';

// Dynamically import the wallet component with SSR disabled
const WalletButton = dynamic(
  () => import('./components/WalletButton'),
  { ssr: false }
);

// Declare the type for the window object
declare global {
  interface Window {
    submitGameScore: (score: number, characterName?: string) => Promise<void>;
    isConnected: boolean;
    connectWallet: () => Promise<void>;
    submitScore: (score: number, characterName?: string) => Promise<boolean>;
    ethereum?: Record<string, unknown>;
  }
}

function GameContent() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const { submitScore, refreshLeaderboard } = useLeaderboard();
  const { isConnected, connectWallet } = useWallet();
  const { isConnected: isXConnected, connect: connectX } = useXAuth();
  const { pendingScore, storePendingScore, submitPendingScore } = usePendingScore();
  const [isMetaMask, setIsMetaMask] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check if MetaMask is available
    const checkMetaMask = () => {
      const hasMetaMask = typeof window.ethereum !== 'undefined' && 
        (window.ethereum as any)?.isMetaMask === true;
      setIsMetaMask(hasMetaMask);
    };

    checkScreenSize();
    checkMetaMask();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Initialize global functions
  useEffect(() => {
    // Define the submitGameScore function
    const submitGameScoreFn = async (score: number, characterName: string = "Player") => {
      try {
        // Store the score and show the confirmation modal
        storePendingScore(score, characterName);
        setShowScoreModal(true);
      } catch (error: any) {
        console.error('Error handling score:', error);
        // Send error message back to iframe
        window.frames[0].postMessage({ type: 'SCORE_ERROR', error: error?.message || 'Unknown error' }, '*');
      }
    };

    // Expose functions to the global window object
    window.submitGameScore = submitGameScoreFn;
    window.isConnected = isConnected;
    window.connectWallet = connectWallet;
    window.submitScore = submitScore;

    // Log the current state for debugging
    console.log('Wallet state:', { isConnected, hasSubmitScore: !!window.submitScore });

    // Cleanup
    return () => {
      delete (window as any).submitGameScore;
      delete (window as any).isConnected;
      delete (window as any).connectWallet;
      delete (window as any).submitScore;
    };
  }, [submitScore, isConnected, connectWallet, refreshLeaderboard, storePendingScore]);

  // Handle iframe communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from our game iframe
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'SUBMIT_SCORE') {
        window.submitGameScore(event.data.score, event.data.characterName);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSubmitScore = async () => {
    // If neither wallet nor X is connected, show wallet modal
    if (!isConnected && !isXConnected) {
      setShowWalletModal(true)
      setShowScoreModal(false)
      return
    }

    if (!pendingScore) {
      console.error('No pending score to submit')
      return
    }

    const success = await submitScore(pendingScore.score, pendingScore.characterName)
    if (success) {
      setShowSuccessSnackbar(true)
    }
    setShowScoreModal(false)
    storePendingScore(0, '') // Reset with default values
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setShowWalletModal(false);
      // Show the score submission modal if there's a pending score
      if (pendingScore) {
        setShowScoreModal(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent("https://topblast.eldor.app");
    const text = encodeURIComponent(
      "Just finished playing this platformer called Top Blast!\r\rSharing for a chance to get my $Avax NFT featured in the Skin Shop. Art by @TimDraws"
    );
    const twitterUrl = `https://x.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#222",
        color: "#fff",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: isMobile ? "column" : "row",
        position: "relative",
      }}
    >
      {/* Left Panel (Leaderboard) - Only on Desktop */}
      {!isMobile && (
        <div
          style={{
            width: "25%",
            height: "100vh",
            background: "linear-gradient(135deg, #1e1e1e, #292929)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#fff",
            padding: "20px",
            boxShadow: "0 0 10px rgba(25, 147, 127, 0.3)",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "10px",
              borderBottom: "2px solid #19937f",
              paddingBottom: "5px",
            }}
          >
            Leaderboard
          </h2>
          <Leaderboard />
        </div>
      )}

      {/* Game in the center */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
          position: "relative",
        }}
      >
        {/* Button Container - Moved outside game container */}
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            zIndex: 20,
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {/* Wallet Connection Button - Only show on desktop */}
          {!isMobile && (
            <div>
              <WalletButton />
            </div>
          )}

          {/* Toggle Button for Mobile */}
          {isMobile && (
            <button
              onClick={() => setIsPanelOpen(true)}
              style={{
                padding: "10px 15px",
                fontSize: "1rem",
                backgroundColor: "#19937f",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0px 0px 10px rgba(25, 147, 127, 0.5)",
              }}
            >
              ℹ️ Info
            </button>
          )}
        </div>

        <div
          style={{
            position: "relative",
            width: "100vw",
            height: "calc(100vw * 16 / 9)",
            maxHeight: "100vh",
            maxWidth: "calc(100vh * 9 / 16)",
          }}
        >
          <iframe
            src="/game/index.html"
            title="Godot Game"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              background: "#000",
              zIndex: 1,
            }}
          ></iframe>
        </div>
      </div>

      {/* Right Panel (Desktop Only) */}
      {!isMobile && (
        <div
          style={{
            width: "25%",
            height: "100vh",
            background: "linear-gradient(135deg, #1e1e1e, #292929)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#fff",
            padding: "20px",
            boxShadow: "0 0 10px rgba(25, 147, 127, 0.3)",
          }}
        >
          <img
            src="/assets/logo.png"
            alt="Game Logo"
            style={{
              width: "80%",
              maxWidth: "150px",
              marginBottom: "15px",
              borderRadius: "10px",
            }}
          />

          {/* "How to Play" Section */}
          <div
            style={{
              width: "90%",
              padding: "15px",
              textAlign: "center",
              fontSize: "1.2rem",
              backgroundColor: "#333",
              borderRadius: "8px",
              marginTop: "10px",
              lineHeight: "1.5",
              boxShadow: "inset 0px 0px 8px rgba(25, 147, 127, 0.3)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", color: "#19937f" }}>
              How to Play
            </h3>
            <p>
              Use <b>Arrow Keys</b> or <b>A/D</b> to move, or let the{" "}
              <b>mouse guide you</b>.
            </p>
            <p>
              Climb as high as you can! If you fall below the screen, the market
              crashes!
            </p>
            <p>
              Purchase skins with <b>AVA Token</b> from the homepage.
            </p>
          </div>

          {/* Share on X Button */}
          {/* <button
            onClick={shareOnTwitter}
            style={{
              marginTop: "20px",
              padding: "12px 18px",
              fontSize: "1rem",
              color: "#fff",
              backgroundColor: "#000000",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.3s",
              boxShadow: "0px 0px 10px rgba(29, 161, 242, 0.5)",
            }}
          >
            🚀 Share on X
          </button> */}
          {/* Info about the drawing incentive */}
          {/* <p
            style={{
              marginTop: "10px",
              fontSize: "1.25rem",
              textAlign: "center",
              color: "#19937f"
            }}
          >
            Share for a chance to get your <b>Avax NFT </b> featured in Top Blast! Drawn by <b>@TimDraws</b>!
          </p> */}
        </div>
      )}

      {/* Slide-Out Panel for Mobile */}
      {isMobile && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "80%",
            height: "100vh",
            background: "#1e1e1e",
            color: "#fff",
            padding: "20px",
            boxShadow: isPanelOpen ? "-5px 0 10px rgba(25, 147, 127, 0.3)" : "none",
            zIndex: 20,
            transform: isPanelOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: "center",
            textAlign: "center",
            gap: "1em",
            overflowY: "auto"
          }}
        >
          {/* Close Button */}
          <button 
            onClick={() => setIsPanelOpen(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "8px 12px",
              fontSize: "1rem",
              backgroundColor: "#19937f",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              zIndex: 30,
            }}
          >
            ❌ Close
          </button>

          {/* Leaderboard Section */}
          <div style={{ width: "100%", marginTop: "40px" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#19937f", marginBottom: "15px" }}>
              Leaderboard
            </h2>
            <Leaderboard />
          </div>

          {/* Info Box */}
          <div
            style={{
              width: "90%",
              padding: "15px",
              textAlign: "center",
              fontSize: "1rem",
              backgroundColor: "#333",
              borderRadius: "8px",
              marginTop: "20px",
              lineHeight: "1.5",
              boxShadow: "inset 0px 0px 8px rgba(25, 147, 127, 0.3)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", color: "#19937f" }}>
              How to Play
            </h3>
            <p>
              Touch follow to guide the player across the charts.
            </p>
            <p>
              Climb as high as you can! If you fall below the screen, the market
              crashes!
            </p>
            <p>
              Purchase skins with <b>AVA Token</b> from the homepage.
            </p>
          </div>

          {/* Share on X Button */}
          <button
            onClick={shareOnTwitter}
            style={{
              marginTop: "20px",
              padding: "12px 18px",
              fontSize: "1rem",
              color: "#fff",
              backgroundColor: "#000000",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.3s",
              boxShadow: "0px 0px 10px rgba(29, 161, 242, 0.5)",
            }}
          >
            🚀 Share on X
          </button>

          {/* Info about the drawing incentive */}
          <p
            style={{
              marginTop: "10px",
              fontSize: "1.25rem",
              textAlign: "center",
              color: "#19937f",
              maxWidth: "90%",
            }}
          >
            Share for a chance to get your <b>Avax NFT </b> featured in Top Blast! Drawn by <b>@TimDraws</b>!
          </p>
        </div>
      )}

      {/* Wallet Connection Modal */}
      <Modal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        title="Connect Wallet"
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px' }}>
            Connect your wallet to submit your score to the leaderboard and compete with other players!
          </p>
          <button
            onClick={handleConnectWallet}
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
            Connect Wallet
          </button>
          <p
            style={{
              marginTop: '15px',
              fontSize: '0.9rem',
              color: '#666',
            }}
          >
            You can still play without connecting your wallet
          </p>
        </div>
      </Modal>

      {/* Score Submission Modal */}
      <Modal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        title="Submit Your Score"
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
            Your Score: <strong>{pendingScore?.score}</strong>
          </p>
          <p style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
            Character: <strong>{pendingScore?.characterName}</strong>
          </p>
          {!isConnected && !isXConnected ? (
            <>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Connect to submit your score to the leaderboard:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <ConnectOptions onScoreSubmit={handleSubmitScore} />
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
            </>
          ) : (
            <>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Would you like to submit this score to the leaderboard?
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={handleSubmitScore}
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
                  Submit Score
                </button>
                <button
                  onClick={() => setShowScoreModal(false)}
                  style={{
                    padding: '12px 24px',
                    fontSize: '1rem',
                    backgroundColor: '#666',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Snackbar
        message="Score successfully submitted"
        isVisible={showSuccessSnackbar}
        onClose={() => setShowSuccessSnackbar(false)}
      />

    </div>
  );
}

export default function GamePage() {
  return (
    <Web3Provider>
      <GameContent />
    </Web3Provider>
  );
}
