const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Queue = require('../queue');

const colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

let pageSize = 10;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recent')
        .setDescription("See recent songs that have been played")
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page to display, defaults to the first page.')
                .setRequired(false)
        ),
        
    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let embed = new MessageEmbed()
            .setTitle("Recently played songs")
            .setColor(colors.aqua)
        ;

        let recentSongs = queue.getPastSongs();

        let page = interaction.options.getInteger("page") ?? 1;

        if (recentSongs.length > pageSize) {
            embed.setDescription(`Showing the last ${pageSize} songs played. To view more use /recent <page>`);
            embed.setFooter({
                text: "Page 1 of " + Math.ceil(recentSongs.length / pageSize)
            })
        }

        // Get the songs to display
        let songs = recentSongs.slice(page * pageSize, pageSize);

        if (songs.length === 0) {
            embed.setDescription("No songs have been played yet");
        } else {
            songs.forEach((song, index) => {
                embed.addField(`[${index + 1}] ${song.title}`, song.artist + (song.album ? " - " + song.album : ""), false);
            });
        }

        await interaction.reply({
            embeds: [embed]
        });
	},
};