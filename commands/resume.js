const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Queue = require('../queue');

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