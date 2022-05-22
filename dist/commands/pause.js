"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const colors = {
    'aqua': 0x5abdd1,
    'red': 0xa11a1a,
    'orange': 0xdbbb1a,
    'green': 0x11ba49
};
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('pause')
        .setDescription("Pauses/resumes the current song"),
    async execute(interaction, queue) {
        await queue.pause();
    },
};
