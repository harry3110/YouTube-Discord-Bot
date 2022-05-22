"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("node:fs"));
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const config = require('dotenv').config();
process.chdir(__dirname);
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}
const rest = new rest_1.REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
rest.put(v9_1.Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.DEV_GUILD_ID), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
//# sourceMappingURL=deploy-commands.js.map