"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('whoami')
        .setDescription("Shows the current user's information"),
    async execute(interaction, queue) {
        await interaction.reply(`Hello ${interaction.user.username} from ${interaction.guild.name}, use tag is '${interaction.user.tag}' and your ID is ${interaction.user.id}`);
    },
};
