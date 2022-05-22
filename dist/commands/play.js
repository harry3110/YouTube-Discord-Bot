"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const youtube_1 = require("../downloaders/youtube");
const emojis = {
    0: "0️⃣",
    1: "1️⃣",
    2: "2️⃣",
    3: "3️⃣",
    4: "4️⃣",
    5: "5️⃣",
    6: "6️⃣",
    7: "7️⃣",
    8: "8️⃣",
    9: "9️⃣",
};
const colors = {
    'aqua': 0x5abdd1,
    'red': 0xa11a1a,
    'orange': 0xdbbb1a,
    'green': 0x11ba49
};
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('play')
        .setDescription("Plays a song from YouTube")
        .addStringOption(option => option.setName('song_name')
        .setDescription('The name of the song to play or add to queue')
        .setRequired(true)),
    async execute(interaction, queue) {
        const downloader = new youtube_1.YouTubeDownloader();
        let songName = interaction.options.getString("song_name");
        let initialEmbed = new discord_js_1.MessageEmbed()
            .setTitle("Searching for songs...")
            .setColor(colors.orange)
            .setDescription("Query: " + songName);
        await interaction.reply({
            embeds: [initialEmbed]
        });
        let songs = await downloader.searchSongs(songName);
        let select_options = [];
        let emoji = 1;
        for (let song_id in songs) {
            let song = songs[song_id];
            select_options.push({
                label: song.title.substring(0, 100),
                value: song_id,
                description: song.artist.substring(0, 100),
                emoji: emojis[emoji++]
            });
        }
        select_options.push({
            label: "Cancel",
            value: "cancel",
            description: "Cancel the search",
            emoji: "❌",
        });
        let select_row = new discord_js_1.MessageActionRow();
        select_row.addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('song_choices')
            .setPlaceholder('Choose a song')
            .addOptions(select_options));
        let embed = new discord_js_1.MessageEmbed()
            .setTitle(`Search results for '${songName}'`)
            .setDescription("Choose a song to play or add to queue")
            .setColor(colors.aqua);
        await interaction.editReply({
            embeds: [embed],
            components: [select_row]
        });
    }
};
