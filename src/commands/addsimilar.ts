import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import { Queue } from "../queue.js";

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

	async execute(interaction, queue: Queue) {
        let embed = new MessageEmbed()
            .setTitle("Adding similar songs...")
            .setColor(colors.aqua)
        ;

        // Send embed
        await interaction.reply({
            embeds: [embed]
        });
        
        console.log("About to add similar songs");

        queue.addSimilarSongsFromQueue(interaction.options.getInteger('amount') ?? 5).then(() => {
            // Edit embed
            let embed = new MessageEmbed()
                .setTitle(`Added similar songs to queue!`)
                .setColor(colors.aqua)
            ;

            interaction.editReply({
                embeds: [embed],
                components: []
            });
        });
	},
};