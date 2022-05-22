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
        .setName('addsimilar')
        .setDescription("Add songs similar to the ones currently in the queue")
        .addIntegerOption(option => option.setName('amount')
        .setDescription("The amount of songs to add")
        .setRequired(false)),
    async execute(interaction, queue) {
        let embed = new discord_js_1.MessageEmbed()
            .setTitle("Adding similar songs...")
            .setColor(colors.aqua);
        console.log("About to add similar songs");
        await queue.addSimilarSongs(interaction.options.getInteger('amount') ?? 30);
        await interaction.reply({
            embeds: [embed]
        });
    },
};
//# sourceMappingURL=addsimilar.js.map