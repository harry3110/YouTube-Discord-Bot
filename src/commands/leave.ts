import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Queue } from "../queue.js";

const colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
        .setDescription("Stop playing music and leave the voice channel"),
        
    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let embed = new MessageEmbed()
            .setTitle("Leaving voice channel... Goodbye :(")
            .setColor(colors.red)
        ;

        queue.leaveVoiceChannel();

        await interaction.reply({
            embeds: [embed]
        });
	},
};