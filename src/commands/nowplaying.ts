import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Queue } from "../queue.js";

const colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
        .setDescription("Shows the current song"),
        
    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let embed = new MessageEmbed()
            .setTitle("Currently Playing")
            .setColor(colors.aqua)
        ;

        if (queue.getCurrentSong()) {
            let song = queue.getCurrentSong();
            embed.addField(song.title,  + " - " + song.artist + (song.album ? " - " + song.album : ""), false);
            embed.setThumbnail(song.cover)
        } else {
            embed.setDescription("No song currently playing");
        }

        await interaction.reply({
            embeds: [embed]
        });
	},
};