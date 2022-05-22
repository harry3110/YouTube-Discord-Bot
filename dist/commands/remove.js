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
        .setName('remove')
        .setDescription("Remove a song from the queue")
        .addStringOption(option => option.setName('song_number')
        .setDescription('The song number to remove (from the queue)')
        .setRequired(true)),
    async execute(interaction, queue) {
        let embed = new discord_js_1.MessageEmbed()
            .setTitle("Removing song in queue")
            .setColor(colors.aqua);
        let song_index = interaction.options.getString("song_number") - 1;
        let song = queue.getSong(song_index);
        if (song) {
            embed.setDescription(`Removing song ${song.title} by ${song.artist}`);
            embed.setThumbnail(song.cover);
            queue.removeSong(song_index);
        }
        else {
            embed.setDescription("A song doesn't exist with that index");
        }
        await interaction.reply({
            embeds: [embed]
        });
    },
};
//# sourceMappingURL=remove.js.map