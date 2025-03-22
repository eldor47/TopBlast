"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { avalanche } from 'wagmi/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector({
      chains: [avalanche],
    }),
  });
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
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
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a7a6a"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#19937f"}
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect()}
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
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a7a6a"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#19937f"}
    >
      Connect Wallet
    </button>
  );
} 