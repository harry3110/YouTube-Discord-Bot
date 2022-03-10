const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
        .setDescription("Shows the current queue"),
        
	async execute(interaction) {
        await interaction.reply("Showing queue");
	},
};