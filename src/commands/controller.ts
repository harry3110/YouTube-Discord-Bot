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
		.setName('controller')
        .setDescription("Control your music with buttons"),

    enabled: false,
        
    /**
     * 
     * @param {*} interaction 
     * @param {Queue} queue 
     */
	async execute(interaction, queue) {
        let embed = new MessageEmbed()
            .setTitle("Control the music")
            .setColor(colors.aqua)
        ;

        let buttons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("previous")
                    .setLabel("⏮")
                    .setStyle("PRIMARY"),

                new MessageButton()
                    .setCustomId("play")
                    .setLabel("⏯")
                    .setStyle("PRIMARY"),

                new MessageButton()
                    .setCustomId("stop")
                    .setLabel("⏹")
                    .setStyle("DANGER"),

                new MessageButton()
                    .setCustomId("repeat_once")
                    .setLabel("🔁")
                    .setStyle("PRIMARY"),

                new MessageButton()
                    .setCustomId("next")
                    .setLabel("⏭")
                    .setStyle("PRIMARY")
            )
        
        ;
        
        await interaction.reply({
            embeds: [embed],
            components: [buttons]
        });
	},
};