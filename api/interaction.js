const nacl = require('tweetnacl');

export default async function handler(req, res) {
    console.log('--- New Request ---');
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.url);

    // Only allow POST requests
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
        console.log('Verifying request signature...');
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
    console.log('Interaction received:', interaction);

    // Respond immediately for Discord's PING
    if (interaction.type === 1) {
        console.log('Responding to PING.');
        return res.status(200).json({ type: 1 });
    }

    // Handle slash commands
    if (interaction.type === 2) {
        const { name } = interaction.data;
        console.log(`Command received: ${name}`);

        if (name === 'ping') {
            console.log('Responding to /ping.');
            return res.status(200).json({
                type: 4, // Respond with a message
                data: {
                    content: 'Pong!',
                },
            });
        }

        if (name === 'hello') {
            console.log('Responding to /hello.');
            return res.status(200).json({
                type: 4, // Respond with a message
                data: {
                    content: 'Hello there! 👋',
                },
            });
        }

        console.error('Unknown command:', name);
        return res.status(400).json({ error: `Unknown command: ${name}` });
    }

    console.error('Unsupported interaction type:', interaction.type);
    res.status(400).json({ error: 'Unsupported interaction type' });
}
