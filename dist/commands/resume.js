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
        .setName('resume')
        .setDescription("Resumes the current song"),
    async execute(interaction, queue) {
        let embed;
        if (!queue.paused) {
            embed = new discord_js_1.MessageEmbed()
                .setTitle("Already playing!")
                .setColor(colors.orange);
            await interaction.reply({
                embeds: [embed]
            });
            return;
        }
        queue.pause();
    },
};
//# sourceMappingURL=resume.js.map