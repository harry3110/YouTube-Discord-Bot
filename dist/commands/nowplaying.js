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
        .setName('nowplaying')
        .setDescription("Shows the current song"),
    async execute(interaction, queue) {
        let embed = new discord_js_1.MessageEmbed()
            .setTitle("Currently Playing")
            .setColor(colors.aqua);
        if (queue.getCurrentSong()) {
            let song = queue.getCurrentSong();
            embed.addField(song.title, +" - " + song.artist + (song.album ? " - " + song.album : ""), false);
            embed.setThumbnail(song.cover);
        }
        else {
            embed.setDescription("No song currently playing");
        }
        await interaction.reply({
            embeds: [embed]
        });
    },
};
//# sourceMappingURL=nowplaying.js.map