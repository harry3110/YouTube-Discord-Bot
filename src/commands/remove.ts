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
		.setName('remove')
        .setDescription("Remove a song from the queue")
        .addStringOption(option =>
            option.setName('song_number')
                .setDescription('The song number to remove (from the queue)')
                .setRequired(true)
        ),
        
    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let embed = new MessageEmbed()
            .setTitle("Removing song in queue")
            .setColor(colors.aqua)
        ;
        
        let song_index = interaction.options.getString("song_number") - 1;
        let song = queue.getSong(song_index);

        if (song) {
            embed.setDescription(`Removing song ${song.title} by ${song.artist}`)
            embed.setThumbnail(song.cover)

            queue.removeSong(song_index);
        } else {
            embed.setDescription("A song doesn't exist with that index");
        }

        await interaction.reply({
            embeds: [embed]
        });
	},
};