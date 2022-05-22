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
        .setName('leave')
        .setDescription("Stop playing music and leave the voice channel"),
    async execute(interaction, queue) {
        let embed = new discord_js_1.MessageEmbed()
            .setTitle("Leaving voice channel... Goodbye :(")
            .setColor(colors.red);
        queue.leaveVoiceChannel();
        await interaction.reply({
            embeds: [embed]
        });
    },
};
//# sourceMappingURL=leave.js.map