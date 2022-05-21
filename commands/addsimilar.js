const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Queue = require('../queue').default;

const colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addsimilar')
        .setDescription("Add songs similar to the ones currently in the queue")
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription("The amount of songs to add")
                .setRequired(false)
        ),

    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let embed = new MessageEmbed()
            .setTitle("Adding similar songs...")
            .setColor(colors.aqua)
        ;
        
        console.log("About to add similar songs");
        await queue.addSimilarSongs(interaction.options.getInteger('amount') ?? 30);

        // Send embed
        await interaction.reply({
            embeds: [embed]
        });
	},
};