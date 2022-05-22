// Config
const config = require('dotenv').config();
const discord_token = process.env.DISCORD_TOKEN;

// Dependancies
import { readdirSync } from 'fs';
import { Client, Intents, Collection, MessageEmbed } from 'discord.js';

// Downloader
import { YouTubeDownloader as Downloader } from "./downloaders/youtube";
let downloader = new Downloader();

// Queue object
import { Queue } from "./queue.js";

// Set current working directory (to /dist)
process.chdir(__dirname);

const colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

// Create a client
const client: any = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

// Register slash commands
client.commands = new Collection();
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log("Registering commands:");

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.data.name, command);
    console.log(` - ${command.data.name} (./commands/${file})`);
}

/**
* @param {Queue} queue
*/
let queue = new Queue(client, null, null, null);

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
                let embed = new MessageEmbed();

                embed.setTitle("There is no command with that name..");
                embed.setColor(colors.red);

                await interaction.reply({
                    embeds: [embed]
                });

                return;
            }

            if ("enabled" in command && !command.enabled) {
                let embed = new MessageEmbed();

                embed.setTitle("This command is not enabled..");
                embed.setColor(colors.red);

                await interaction.reply({
                    embeds: [embed]
                });

                return;
            }

            queue.setGuildId(interaction.guildId);
            queue.setVoiceChannel(interaction.member.voice.channel);
            queue.setTextChannel(interaction.channel);
            queue.setLastInteraction(interaction);
            queue.setDownloader(downloader);

            await command.execute(interaction, queue);
            
        } else if (interaction.isSelectMenu()) {
            let select_id = interaction.customId;
            let values = interaction.values;

            if (select_id === "song_choices") {
                const video_id = values[0];

                if (video_id === "cancel") {
                    let embed = new MessageEmbed();

                    embed.setTitle("Search cancelled.");
                    embed.setColor(colors.red);

                    await interaction.update({
                        embeds: [embed],
                        components: []
                    });

                    return;
                }
                
                let embed = new MessageEmbed()
                    .setTitle(`Adding song to queue...`)
                    .setColor(colors.orange)
                ;

                interaction.update({
                    embeds: [embed],
                    components: []
                });

                // Get song information
                let song_data = downloader.getSongData(video_id);

                // Add song to queue
                queue.addOrPlay(song_data);
            } else {
                let embed = new MessageEmbed()
                    .setTitle(`There was an error with your selection.`)
                    .setColor(colors.red)
                ;

                await interaction.update({
                    embeds: [embed],
                });
            }
        }
        
    } catch (error) {
        console.log(error);

        // try {
        //     await interaction.reply({
        //         content: "An error occurred while processing your request.",
        //         ephemeral: true
        //     });
        // } catch (error) {
        //     await interaction.editReply({
        //         content: "An error occurred while processing your request.",
        //         ephemeral: true
        //     });
        // }
    }
});

// Login to Discord with the token
client.login(discord_token);