"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const colors = {
    'aqua': 0x5abdd1,
    'red': 0xa11a1a,
    'orange': 0xdbbb1a,
    'green': 0x11ba49
};
let pageSize = 10;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('recent')
        .setDescription("See recent songs that have been played")
        .addIntegerOption(option => option.setName('page')
        .setDescription('The page to display, defaults to the first page.')
        .setRequired(false)),
    async execute(interaction, queue) {
        let embed = new discord_js_1.MessageEmbed()
            .setTitle("Recently played songs")
            .setColor(colors.aqua);
        let recentSongs = queue.getPastSongs();
        if (recentSongs.length === 0) {
            embed.setDescription("No songs have been played yet.");
            await interaction.reply({
                embeds: [embed]
            });
            return;
        }
        let page = interaction.options.getInteger("page") ?? 1;
        let index = page--;
        if (recentSongs.length > pageSize) {
            embed.setDescription(`Showing the last ${pageSize} songs played. To view more use /recent <page>`);
            embed.setFooter({
                text: "Page 1 of " + Math.ceil(recentSongs.length / pageSize)
            });
        }
        let songs = recentSongs.slice(index * pageSize, pageSize);
        if (songs.length === 0) {
            embed.setDescription(`There are no songs are on page ${page}.`);
        }
        else {
            songs.forEach((song, index) => {
                embed.addField(`${song.title}`, song.artist + (song.album ? " - " + song.album : "") + (song.skipped ? " (skipped)" : ""), false);
            });
        }
        await interaction.reply({
            embeds: [embed]
        });
    },
};
