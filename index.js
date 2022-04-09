// Config
const config = require('dotenv').config()

const discord_token = process.env.DISCORD_TOKEN

// Node
const fs = require('fs');

// Discord JS
const discord = require('discord.js');
const { Routes } = require('discord-api-types/v9');

// Downloader
const downloader = require("./downloaders/youtube.js");

// Associative array of all songs in queue. Key is the guild ID, value is an array of songs.
const Queue = require("./queue.js");

colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

// Create a client
const client = new discord.Client({
    intents: [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MESSAGES,
        discord.Intents.FLAGS.GUILD_VOICE_STATES
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

/**
 * @param {Queue} queue
 */
let queue = new Queue(null, null, null);

// On client ready
client.once('ready', async () => {
	console.log(`Logged in as ${client.user.username}`);

    client.user.setActivity("music", {
        type: "LISTENING"
    });
});

// On interaction
client.on("interactionCreate", async interaction => {
    try {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            
            if (!command) {
                let embed = new discord.MessageEmbed()

                embed.setTitle("There is no command with that name..");
                embed.setColor(colors.red);

                await interaction.reply({
                    embeds: [embed]
                });
            }

            queue.setGuildId(interaction.guildId);
            queue.setVoiceChannel(interaction.member.voice.channel);
            queue.setTextChannel(interaction.channelId);
            queue.setLastInteraction(interaction);

            await command.execute(interaction, queue)

            // If there is a response, set the queue to it
            /* if (command_response) {
                queue = command_response.queue;
            } */
        } else if (interaction.isSelectMenu()) {
            // If select method exists
            /* if (command.onSelect) {
                await command.onSelect(interaction);
            } */

            // console.log(interaction);

            let select_id = interaction.customId;
            let values = interaction.values;

            if (select_id === "song_choices") {
                video_id = values[0];
                
                let embed = new discord.MessageEmbed()
                    .setTitle(`Adding song to queue...`)
                    .setColor(colors.orange)
                ;

                interaction.update({
                    embeds: [embed],
                    components: []
                });

                // Get song information
                let song_data = await downloader.getSongData(video_id)

                embed = new discord.MessageEmbed()
                    .setTitle(`Downloading ${song_data.title} by ${song_data.artist}...`)
                    .setColor(colors.orange)
                ;

                await interaction.editReply({
                    embeds: [embed],
                    components: []
                });

                // Completed message
                embed = new discord.MessageEmbed()
                    .setTitle(`Downloaded  ${song_data.title} by ${song_data.artist}!`)
                    .setColor(colors.green)
                ;

                interaction.editReply({
                    embeds: [embed],
                    components: []
                });

                // console.log(interaction.member.voice);
                // console.log(interaction);

                // Add song to queue
                queue.addOrPlay(song_data);
            } else {
                let embed = new discord.MessageEmbed()
                    .setTitle(`There was an error with your selection.`)
                    .setColor(colors.red)
                ;

                interaction.update({
                    embeds: [embed],
                })
            }
        }
        
    } catch (error) {
        console.log(error);

        /* await interaction.reply({
            content: "An error occurred while processing your request.",
            ephemeral: true
        }); */
    }
})

// Login to Discord with the token
client.login(discord_token);