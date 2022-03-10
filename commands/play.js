const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu  } = require('discord.js');
const downloader = require("../downloaders/youtube");

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

        /* let button_row = new MessageActionRow();

        // Button row
        for (let i = 1; i <= 5; i++) {
            button_row.addComponents(
                new MessageButton()
                    .setCustomId("video_id_" + i)
                    .setLabel(i.toString())
                    .setStyle("PRIMARY")
            )
        } */

        // Get songs
        let songs = await downloader.searchSongs(interaction.options.getString("song_name"));
        
        let select_options = [];

        for (let song_id in songs) {
            let song = songs[song_id];

            select_options.push({
                label: song.title,
                value: song_id,
                description: song.artist
            })
        }


        let select_row = new MessageActionRow();

        select_row.addComponents(
            new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Nothing selected')
                .addOptions(select_options)
        );

		await interaction.reply({ content: 'Pong!', components: [select_row] });
	},
};