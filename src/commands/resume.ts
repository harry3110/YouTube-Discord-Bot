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
		.setName('resume')
        .setDescription("Resumes the current song"),
        
    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let embed;

        // If the queue is not paused, tell the user
        if (!queue.paused) {
            embed = new MessageEmbed()
                .setTitle("Already playing!")
                .setColor(colors.orange)
            ;

            await interaction.reply({
                embeds: [embed]
            });

            return;
        }

        queue.pause();
	},
};