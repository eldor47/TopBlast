"use client";

import { useEffect, useState } from "react";

export default function GamePage() {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size on mount & resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
      {/* Only show side panels on desktop */}
      {!isMobile && (
        <>
          {/* Left Panel (Leaderboard) */}
          <div
            style={{
              width: "25%",
              height: "100vh", // Full screen height
              backgroundColor: "#222",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#fff",
              padding: "20px",
              borderRight: "2px solid #ff9800", // Adds a nice separator effect
            }}
          >
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
            <div
              style={{
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
              }}
            >
              🏆 Coming Soon! 🏆
            </div>
          </div>
        </>
      )}

      {/* Game in the center (always visible) */}
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

      {/* Only show side panels on desktop */}
      {!isMobile && (
        <>
          {/* Right Panel (Wallet/Info) */}
          <div
            style={{
              width: "25%",
              height: "100vh", // Full screen height
              backgroundColor: "#222",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#fff",
              padding: "20px",
              borderLeft: "2px solid #ff9800", // Adds a nice separator effect
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
                fontSize: "0.9rem",
                backgroundColor: "#333",
                borderRadius: "5px",
                marginTop: "10px",
                lineHeight: "1.5",
                boxShadow: "inset 0px 0px 5px rgba(255, 152, 0, 0.3)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  color: "#ff9800",
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
                Climb as high as you can! If you fall below the screen, the
                market crashes!
              </p>
              <p>
                Purchase skins with <b>AVA Token</b> from the homepage.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
