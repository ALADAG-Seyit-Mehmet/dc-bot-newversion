const { ActivityType } = require('discord.js');
const config = require('../../config.json');

async function updateStats(guild) {
    try {
        // Yapılandırma kontrolü
        if (!config.STATS_CATEGORY_ID || !config.STATS_TOTAL_ID || 
            !config.STATS_ONLINE_ID || !config.STATS_BOT_ID) {
            console.log('İstatistik kanalları yapılandırılmamış.');
            return;
        }

        // Tüm üyeleri çek
        const members = await guild.members.fetch();
        
        // İstatistikleri hesapla
        const totalMembers = guild.memberCount;
        const botMembers = members.filter(member => member.user.bot).size;
        const onlineMembers = members.filter(member => 
            member.presence?.status && member.presence.status !== 'offline'
        ).size;

        // Kanalları güncelle
        const totalChannel = guild.channels.cache.get(config.STATS_TOTAL_ID);
        const onlineChannel = guild.channels.cache.get(config.STATS_ONLINE_ID);
        const botChannel = guild.channels.cache.get(config.STATS_BOT_ID);

        if (totalChannel) {
            await totalChannel.setName(`Toplam Üye: ${totalMembers}`);
        }

        if (onlineChannel) {
            await onlineChannel.setName(`Çevrimiçi: ${onlineMembers}`);
        }

        if (botChannel) {
            await botChannel.setName(`Botlar: ${botMembers}`);
        }
    } catch (error) {
        console.error('İstatistik güncelleme hatası:', error);
    }
}

module.exports = { updateStats };