import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Top Blast",
  description: "Gamified chart jumper. How high can you reach?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Play TopBlast 🚀" />
        <meta
          name="twitter:description"
          content="Climb the charts as your favorite $AVAX characters"
        />
        <meta
          name="twitter:image"
          content="https://topblast.eldor.app/assets/share.png"
        />
        <meta name="twitter:site" content="@eldor4747" />
      </Head>
      <body>
        {children}
      </body>
    </html>
  );
}
