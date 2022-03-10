// Config
const config = require('dotenv').config()

const discord_token = process.env.DISCORD_TOKEN

// Node
const fs = require('node:fs');

// Discord JS
const discord = require('discord.js');
const { Routes } = require('discord-api-types/v9');

// Associative array of all songs in queue. Key is the guild ID, value is an array of songs.
let queue = {};

// Create a client
const client = new discord.Client({
    intents: [
        discord.Intents.FLAGS.GUILDS
    ]
});

// Register slash commands
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log("Registering commands:");

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
    console.log(` - ${command.data.name} (./commands/${file})`);
}

// On client ready
client.once('ready', () => {
	console.log(`Logged in as ${client.user.username}`);
    
    // const guild_ids = client.guilds.cache.map(guild => guild.id);

    // console.log("Registering guild slash commands");

    // Register the slash commands
    /* guild_ids.forEach(async guild_id => {
        const rest = new REST({ version: '9' }).setToken(discord_token);

        rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, guild_id), { body: commands })
            .then(() => console.log(`- Registered for ${guild_id}.`))
            .catch(console.error)
        ;
    }); */

    /* let songs = searchSongs("She makes me wanna").then((x) => {
        console.log(x);
    }); */
});

// On interaction
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction)


        // If there is a response, set the queue to it
        /* if (command_response) {
            queue = command_response.queue;
        } */
        
    } catch (error) {
        console.log(error);

        await interaction.reply({
            content: "An error occurred while processing your request.",
            ephemeral: true
        })
    }
})

// Login to Discord with the token
client.login(discord_token);