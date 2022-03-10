const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu  } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
        .setDescription("Plays a song from YouTube")
        .addStringOption(option =>
            option.setName('song_name')
                .setDescription('The name of the song to play or add to queue')
                .setRequired(true)),
        
	async execute(interaction) {
        // await interaction.reply("Playing song");

        let button_row = new MessageActionRow();

        // Button row
        for (let i = 1; i <= 5; i++) {
            button_row.addComponents(
                new MessageButton()
                    .setCustomId("video_id_" + i)
                    .setLabel(i.toString())
                    .setStyle("PRIMARY")
            )
        }

        // Select row
        let select_row = new MessageActionRow();

        select_row.addComponents(
            new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Nothing selected')
                .addOptions([
                    {
                        label: 'She Makes Me Wanna',
                        description: 'JLS',
                        value: 'video_id_here',
                    },
                    {
                        label: 'Another song',
                        description: 'Another artist',
                        value: 'the_other_video_id',
                    },
                ])
        );

		await interaction.reply({ content: 'Pong!', components: [button_row, select_row] });
	},
};