const fetch = require('node-fetch');

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [
    {
        name: 'ping',
        description: 'Responds with Pong!',
    },
];

(async () => {
    try {
        console.log('Registering slash commands...');
        const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${DISCORD_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commands),
        });

        const data = await response.json();
        console.log('Slash commands registered:', data);
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
})();
