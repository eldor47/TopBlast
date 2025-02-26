"use client";

import { useEffect, useState } from "react";

export default function GamePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
        flexDirection: "row",
      }}
    >
      {/* Left Panel (Leaderboard) */}
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
            boxShadow: "0 0 10px rgba(25, 147, 127, 0.3)", // Soft glow effect in new teal color
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
          <div
            style={{
              width: "90%",
              padding: "15px",
              textAlign: "center",
              fontSize: "1rem",
              fontWeight: "bold",
              color: "#19937f",
              backgroundColor: "#333",
              borderRadius: "8px",
              marginBottom: "15px",
              boxShadow: "inset 0px 0px 8px rgba(25, 147, 127, 0.5)",
            }}
          >
            🏆 Coming Soon! 🏆
          </div>
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
        }}
      >
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
            }}
          ></iframe>
        </div>
      </div>

      {/* Right Panel (Wallet/Info) */}
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
            boxShadow: "0 0 10px rgba(25, 147, 127, 0.3)", // Soft glow effect in new teal color
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
            <h3
              style={{
                fontSize: "1.2rem",
                color: "#19937f",
                marginBottom: "5px",
              }}
            >
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

          {/* Share on Twitter Button */}
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
              boxShadow: "0px 0px 10px rgba(29, 161, 242, 0.5)", // Twitter glow effect
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            🚀 Share on X
          </button>

          {/* Info about the drawing incentive */}
          <p
            style={{
              marginTop: "10px",
              fontSize: "1.25rem",
              textAlign: "center",
              color: "#19937f"
            }}
          >
            Share for a chance to get your <b>Avax NFT </b> featured in Top Blast! Drawn by <b>@TimDraws</b>!
          </p>
        </div>
      )}
    </div>
  );
}
