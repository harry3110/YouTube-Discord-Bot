"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('dotenv').config();
const discord_token = process.env.DISCORD_TOKEN;
const fs_1 = require("fs");
const discord_js_1 = require("discord.js");
const youtube_1 = require("./downloaders/youtube");
let downloader = new youtube_1.YouTubeDownloader();
const queue_js_1 = require("./queue.js");
process.chdir(__dirname);
const colors = {
    'aqua': 0x5abdd1,
    'red': 0xa11a1a,
    'orange': 0xdbbb1a,
    'green': 0x11ba49
};
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES
    ]
});
client.commands = new discord_js_1.Collection();
const commandFiles = fs_1.readdirSync('./commands').filter(file => file.endsWith('.js'));
console.log("Registering commands:");
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    console.log(` - ${command.data.name} (./commands/${file})`);
}
let queue = new queue_js_1.Queue(client, null, null, null);
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.username}`);
    client.user.setActivity("music", {
        type: "LISTENING"
    });
});
client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                let embed = new discord_js_1.MessageEmbed();
                embed.setTitle("There is no command with that name..");
                embed.setColor(colors.red);
                await interaction.reply({
                    embeds: [embed]
                });
                return;
            }
            if ("enabled" in command && !command.enabled) {
                let embed = new discord_js_1.MessageEmbed();
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
        }
        else if (interaction.isSelectMenu()) {
            let select_id = interaction.customId;
            let values = interaction.values;
            if (select_id === "song_choices") {
                const video_id = values[0];
                if (video_id === "cancel") {
                    let embed = new discord_js_1.MessageEmbed();
                    embed.setTitle("Search cancelled.");
                    embed.setColor(colors.red);
                    await interaction.update({
                        embeds: [embed],
                        components: []
                    });
                    return;
                }
                let embed = new discord_js_1.MessageEmbed()
                    .setTitle(`Adding song to queue...`)
                    .setColor(colors.orange);
                interaction.update({
                    embeds: [embed],
                    components: []
                });
                let song_data = await downloader.getSongData(video_id);
                queue.addOrPlay(song_data);
            }
            else {
                let embed = new discord_js_1.MessageEmbed()
                    .setTitle(`There was an error with your selection.`)
                    .setColor(colors.red);
                await interaction.update({
                    embeds: [embed],
                });
            }
        }
    }
    catch (error) {
        console.log(error);
    }
});
client.login(discord_token);
//# sourceMappingURL=index.js.map