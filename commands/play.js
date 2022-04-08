const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu, MessageEmbed } = require('discord.js');
const downloader = require("../downloaders/youtube");

const emojis = {
    0: "0️⃣",
    1: "1️⃣",
    2: "2️⃣",
    3: "3️⃣",
    4: "4️⃣",
    5: "5️⃣",
    6: "6️⃣",
    7: "7️⃣",
    8: "8️⃣",
    9: "9️⃣",
};

colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
        .setDescription("Plays a song from YouTube")
        .addStringOption(option =>
            option.setName('song_name')
                .setDescription('The name of the song to play or add to queue')
                .setRequired(true)),
        
	async execute(interaction) {
        let songName = interaction.options.getString("song_name");

        let initialEmbed = new MessageEmbed()
            .setTitle("Searching for songs...")
            .setColor(colors.orange)
            .setDescription("Query: " + songName)
        ;

        interaction.reply({
            embeds: [initialEmbed]
        });

        // Get songs
        let songs = await downloader.searchSongs(songName);
        
        let select_options = [];
        let emoji = 1;

        for (let song_id in songs) {
            let song = songs[song_id];

            // Add song to select
            select_options.push({
                label: song.title,
                value: song_id,
                description: song.artist,
                emoji: emojis[emoji++]
            })
        }

        let select_row = new MessageActionRow();

        select_row.addComponents(
            new MessageSelectMenu()
                .setCustomId('song_choices')
                .setPlaceholder('Choose a song')
                .addOptions(select_options)
        );

        let embed = new MessageEmbed()
            .setTitle(`Search results for '${songName}'`)
            .setDescription("Choose a song to play or add to queue")
            .setColor(colors.aqua)
        ;

		await interaction.editReply({
            embeds: [embed],
            components: [select_row]
        });
	}
};