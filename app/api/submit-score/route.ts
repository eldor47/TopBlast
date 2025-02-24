// API Route for Next.js (pages/api/submit-score.ts)
import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json();
    const { wallet, score, message, signature } = body;
    if (!wallet || typeof score !== 'number' || !message || !signature) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    try {
        // Verify wallet signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== wallet.toLowerCase()) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Send score to AWS Lambda backend
        const response = await fetch('https://your-api-gateway-url/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet, score }),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (err) {
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 500 });
    }
}