import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Top Blast",
  description: "Gamified chart jumper. How high can you reach?",
  twitter: {
    card: "summary_large_image",
    title: "Play TopBlast 🚀",
    description: "Climb the charts as your favorite $AVAX characters",
    images: ["https://topblast.eldor.app/share.png"], // Ensure this image exists in `public/`
    site: "@eldor4747",
  },
  openGraph: {
    title: "Play TopBlast 🚀",
    description: "Climb the charts as your favorite $AVAX characters",
    images: [
      {
        url: "https://topblast.eldor.app/share.png", // Ensure this file is in `public/`
        width: 1200,
        height: 630,
        alt: "Top Blast",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
