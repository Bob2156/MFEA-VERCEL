const nacl = require('tweetnacl');

export default async function handler(req, res) {
    console.log('Request received:', req.method, req.url);

    if (req.method !== 'POST') {
        console.error('Invalid HTTP method:', req.method);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

    // Verify the request signature
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const rawBody = JSON.stringify(req.body);

    try {
        const isVerified = nacl.sign.detached.verify(
            Buffer.from(timestamp + rawBody),
            Buffer.from(signature, 'hex'),
            Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
        );

        if (!isVerified) {
            console.error('Request signature verification failed.');
            return res.status(401).json({ error: 'Invalid request signature' });
        }
    } catch (error) {
        console.error('Error verifying request signature:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    const interaction = req.body;
    console.log('Interaction payload:', interaction);

    try {
        if (interaction.type === 1) {
            // Respond to Discord's PING
            console.log('Responding to PING.');
            return res.status(200).json({ type: 1 });
        }

        if (interaction.type === 2) {
            // Handle slash commands
            const { name } = interaction.data;
            console.log(`Slash command received: ${name}`);

            if (name === 'ping') {
                console.log('Responding to /ping.');
                return res.status(200).json({
                    type: 4, // Channel message with source
                    data: {
                        content: 'Pong!',
                    },
                });
            } else {
                console.error('Unknown command:', name);
                return res.status(400).json({ error: `Unknown command: ${name}` });
            }
        }

        console.error('Unsupported interaction type:', interaction.type);
        res.status(400).json({ error: 'Unsupported interaction type' });
    } catch (error) {
        console.error('Error handling interaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
