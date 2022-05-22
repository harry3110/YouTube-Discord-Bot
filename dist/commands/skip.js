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
        .setName('skip')
        .setDescription("Skips the current song"),
    async execute(interaction, queue) {
        let songToSkip = queue.getCurrentSong();
        let success = queue.skip();
        let embed;
        if (success) {
            embed = new discord_js_1.MessageEmbed()
                .setTitle(`Skipped ${songToSkip.title} by ${songToSkip.artist}`)
                .setColor(colors.green);
        }
        else {
            embed = new discord_js_1.MessageEmbed()
                .setTitle("There is no song playing to skip.")
                .setColor(colors.red);
        }
        await interaction.reply({
            embeds: [embed]
        });
    },
};
//# sourceMappingURL=skip.js.map