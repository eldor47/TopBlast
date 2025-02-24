"use client";

import { useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';

// Extend window object to include ethereum property
declare global {
    interface Window {
        ethereum?: any;
    }
}

// Define the styles using React's CSSProperties type
const leaderboardStyle: React.CSSProperties = {
    width: "20%",
    padding: "20px",
    backgroundColor: "#222",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#fff",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
};

const leaderboardSlotStyle: React.CSSProperties = {
    width: "90%",
    padding: "10px",
    textAlign: "center",
    fontSize: "1rem",
    fontWeight: "bold",
    backgroundColor: "#444",
    color: "#fff",
    borderRadius: "5px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease",
    cursor: "pointer",
};

const comingSoonStyle: React.CSSProperties = {
    width: "90%",
    padding: "15px",
    textAlign: "center",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#ff9800",
    backgroundColor: "#333",
    borderRadius: "5px",
    marginBottom: "15px",
    boxShadow: "inset 0px 0px 5px rgba(255, 152, 0, 0.5)",
};

export default function GamePage() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                setWalletAddress(accounts[0] || null);
                setIsConnected(accounts.length > 0);
            });
        }
    }, []);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new Web3Provider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            setWalletAddress(accounts[0]);
            setIsConnected(true);
        } else {
            alert('MetaMask not detected');
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setIsConnected(false);
    };

    const submitScore = async (score: number) => {
        if (!walletAddress) return alert('Connect wallet first');
        
        const provider = new Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const message = `I am submitting a score of ${score}`;
        const signature = await signer.signMessage(message);

        const response = await fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: walletAddress, score, message, signature }),
        });
        
        const data = await response.json();
        alert(data.message || data.error);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#222', color: '#fff' }}>
            <div style={leaderboardStyle}>
                <h2
                    style={{
                        fontSize: "1.5rem",
                        marginBottom: "10px",
                        borderBottom: "2px solid #ff9800",
                        paddingBottom: "5px",
                    }}
                >
                    Leaderboard
                </h2>

                {/* Coming Soon Message */}
                <div style={comingSoonStyle}>🏆 Coming Soon! 🏆</div>

                {/* Placeholder leaderboard slots */}
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <div style={leaderboardSlotStyle}>WaifuLover - 1.65B</div>
                    <div style={leaderboardSlotStyle}>BlubBoy - 775M</div>
                    <div style={leaderboardSlotStyle}>Eldor - 400M</div>
                </div>
            </div>


            {/* Game in the center */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: '100vw', 
                height: '100vh'  // Ensure full height for proper scaling
            }}>
                <div style={{ 
                    position: 'relative', 
                    width: '100vw', 
                    height: 'calc(100vw * 16 / 9)', // Maintain 9:16 aspect ratio dynamically
                    maxHeight: '100vh',  // Prevent overflow on small screens
                    maxWidth: 'calc(100vh * 9 / 16)' // Limit max width based on height
                }}>
                    <iframe
                        src="/game/index.html"
                        title="Godot Game"
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            border: 'none', 
                            background: '#000' 
                        }}
                    ></iframe>
                </div>
            </div>



        {/* Logo and wallet connection on the right */}
        <div style={{
            width: "20%",
            padding: "20px",
            backgroundColor: "#222",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
            paddingBottom: "20px"
        }}>
            {/* Logo Image */}
            <img
                src="/assets/logo.png" // Replace with your actual image path
                alt="Game Logo"
                style={{
                    width: "80%",
                    maxWidth: "150px",
                    marginBottom: "15px",
                    borderRadius: "10px",
                }}
            />

            {/* "How to Play" Section */}
            <div style={{
                width: "90%",
                padding: "15px",
                textAlign: "center",
                fontSize: "0.9rem",
                backgroundColor: "#333",
                borderRadius: "5px",
                marginTop: "10px",
                lineHeight: "1.5",
                boxShadow: "inset 0px 0px 5px rgba(255, 152, 0, 0.3)"
            }}>
                <h3 style={{ fontSize: "1.2rem", color: "#ff9800", marginBottom: "5px" }}>How to Play</h3>
                <p>Use <b>Arrow Keys</b> or <b>A/D</b> to move, or let the <b>mouse guide you</b>.</p>
                <p>Climb as high as you can! If you fall below the screen, the market crashes!</p>
                <p>Purchase skins with <b>AVA Token</b> from the homepage.</p>
            </div>

            {/* Wallet Section */}
            <div style={{ width: "90%", marginTop: "20px", textAlign: "center" }}>
                <h3 style={{ fontSize: "1rem", color: "#ff9800", marginBottom: "10px" }}>Wallet Connection</h3>

                {/* Disabled Connect Button with "Coming Soon" */}
                <button 
                    disabled
                    style={{
                        width: "100%",
                        padding: "10px",
                        fontSize: "1rem",
                        backgroundColor: "#555", // Gray out since it's disabled
                        border: "none",
                        cursor: "not-allowed",
                        color: "#ccc",
                        borderRadius: "5px",
                        marginBottom: "5px"
                    }}
                >
                    Connect Wallet
                </button>
                <p style={{ fontSize: "0.8rem", color: "#ff9800", marginBottom: "15px" }}>🔒 Coming Soon!</p>

                {/* Disconnect Wallet Button */}
                {isConnected && (
                    <>
                        <p style={{ fontSize: "0.9rem", marginBottom: "5px", color: "#fff" }}>
                            Connected: <b>{walletAddress}</b>
                        </p>
                        <button
                            onClick={disconnectWallet}
                            style={{
                                width: "100%",
                                padding: "10px",
                                fontSize: "1rem",
                                backgroundColor: "#f44336", // Red for disconnect
                                border: "none",
                                cursor: "pointer",
                                color: "#fff",
                                borderRadius: "5px",
                                transition: "0.3s ease"
                            }}
                        >
                            Disconnect Wallet
                        </button>
                    </>
                )}
            </div>
        </div>



        </div>
    );
}
