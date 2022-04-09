const { SlashCommandBuilder } = require('@discordjs/builders');
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
        let embed = new MessageEmbed()
            .setTitle("Skipping song")
            .setColor(colors.red)
        ;

        queue.skip();

        await interaction.reply({
            embeds: [embed]
        });
	},
};