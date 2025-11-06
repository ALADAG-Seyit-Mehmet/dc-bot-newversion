const { Events } = require('discord.js');
const { updateStats } = require('../utils/updateStats.js');
const { checkGiveaways } = require('../utils/giveawayManager.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);

        // İlk istatistik güncellemesi
        for (const guild of client.guilds.cache.values()) {
            await updateStats(guild);
        }

        // Her 15 dakikada bir istatistikleri güncelle
        setInterval(async () => {
            for (const guild of client.guilds.cache.values()) {
                await updateStats(guild);
            }
        }, 15 * 60 * 1000); // 15 dakika

        // Her 60 saniyede bir çekilişleri kontrol et
        setInterval(async () => {
            await checkGiveaways(client);
        }, 60 * 1000); // 60 saniye
    },
};