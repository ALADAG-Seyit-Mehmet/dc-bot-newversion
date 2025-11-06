const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
    },
};