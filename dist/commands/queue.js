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
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('queue')
        .setDescription("Shows the current queue"),
    async execute(interaction, queue) {
        let embed = new discord_js_1.MessageEmbed()
            .setTitle("Current queue")
            .setColor(colors.aqua);
        if (queue.getCurrentSong()) {
            let song = queue.getCurrentSong();
            embed.addField("Currently playing", song.title + " - " + song.artist, false);
            embed.setThumbnail(song.cover);
        }
        if (queue.getSongQueue().length === 0) {
            embed.setDescription("Queue is empty");
        }
        else {
            queue.getSongQueue().forEach((song, index) => {
                embed.addField(`[${index + 1}] ${song.title}`, song.artist + (song.album ? " - " + song.album : ""), false);
            });
        }
        await interaction.reply({
            embeds: [embed]
        });
    },
};
