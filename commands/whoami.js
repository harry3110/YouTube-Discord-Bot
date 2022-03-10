const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whoami')
        .setDescription("Shows the current user's information"),
        
	async execute(interaction) {
        await interaction.reply(`Hello ${interaction.user.username} from ${interaction.guild.name}, use tag is '${interaction.user.tag}' and your ID is ${interaction.user.id}`);
	},
};