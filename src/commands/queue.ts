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
		.setName('queue')
        .setDescription("Shows the current queue"),
        
    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let embed = new MessageEmbed()
            .setTitle("Current queue")
            .setColor(colors.aqua)
        ;

        if (queue.getCurrentSong()) {
            let song = queue.getCurrentSong();
            embed.addField("Currently playing", song.title + " - " + song.artist, false);
            embed.setThumbnail(song.cover)
        }

        if (queue.getSongQueue().length === 0) {
            embed.setDescription("Queue is empty");
        } else {
            // Loop through each song in the queue
            queue.getSongQueue().forEach((song, index) => {
                embed.addField(`[${index + 1}] ${song.title}`, song.artist + (song.album ? " - " + song.album : ""), false);
            });
        }

        await interaction.reply({
            embeds: [embed]
        });
	},
};