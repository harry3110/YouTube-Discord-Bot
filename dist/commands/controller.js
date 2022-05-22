"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const colors = {
    'aqua': 0x5abdd1,
    'red': 0xa11a1a,
    'orange': 0xdbbb1a,
    'green': 0x11ba49
};
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('controller')
        .setDescription("Control your music with buttons"),
    enabled: false,
    async execute(interaction, queue) {
        let embed = new discord_js_1.MessageEmbed()
            .setTitle("Control the music")
            .setColor(colors.aqua);
        let buttons = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageButton()
            .setCustomId("previous")
            .setLabel("⏮")
            .setStyle("PRIMARY"), new discord_js_1.MessageButton()
            .setCustomId("play")
            .setLabel("⏯")
            .setStyle("PRIMARY"), new discord_js_1.MessageButton()
            .setCustomId("stop")
            .setLabel("⏹")
            .setStyle("DANGER"), new discord_js_1.MessageButton()
            .setCustomId("repeat_once")
            .setLabel("🔁")
            .setStyle("PRIMARY"), new discord_js_1.MessageButton()
            .setCustomId("next")
            .setLabel("⏭")
            .setStyle("PRIMARY"));
        await interaction.reply({
            embeds: [embed],
            components: [buttons]
        });
    },
};
