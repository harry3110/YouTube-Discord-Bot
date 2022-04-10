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
		.setName('skip')
        .setDescription("Skips the current song"),
        
    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let songToSkip = queue.getCurrentSong();
        let success = queue.skip();
        let embed;

        if (success) {
            embed = new MessageEmbed()
                .setTitle(`Skipped ${songToSkip.title} by ${songToSkip.artist}`)
                .setColor(colors.green)
            ;
        } else {
            embed = new MessageEmbed()
                .setTitle("There is no song playing to skip.")
                .setColor(colors.red)
            ;
        }

        await interaction.reply({
            embeds: [embed]
        });
	},
};