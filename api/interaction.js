const nacl = require('tweetnacl');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

    // Verify request signature
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const rawBody = JSON.stringify(req.body);

    const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody),
        Buffer.from(signature, 'hex'),
        Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
    );

    if (!isVerified) {
        return res.status(401).json({ error: 'Invalid request signature' });
    }

    const interaction = req.body;

    // Handle Discord's PING
    if (interaction.type === 1) {
        return res.status(200).json({ type: 1 });
    }

    // Handle slash command
    if (interaction.type === 2 && interaction.data.name === 'ping') {
        return res.status(200).json({
            type: 4, // Channel message with source
            data: {
                content: 'Pong!',
            },
        });
    }

    res.status(400).json({ error: 'Bad Request' });
}
