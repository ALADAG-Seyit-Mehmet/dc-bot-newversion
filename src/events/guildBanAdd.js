const { Events } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');

module.exports = {
    name: Events.GuildBanAdd,
    async execute(ban) {
        const auditLogs = await ban.guild.fetchAuditLogs({
            type: 22, // BAN_MEMBER
            limit: 1
        });
        
        const banLog = auditLogs.entries.first();
        const executor = banLog?.executor;
        const reason = banLog?.reason || ban.reason || 'Sebep belirtilmedi';

        await sendLogEmbed(ban.client, {
            title: '🔨 Üye Yasaklandı',
            color: '#ff0000',
            fields: [
                { name: 'Yasaklanan Kullanıcı', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
                { name: 'Yasaklayan Yetkili', value: executor ? `${executor.tag} (${executor.id})` : 'Bilinmiyor', inline: true },
                { name: 'Sebep', value: reason }
            ],
            thumbnail: ban.user.displayAvatarURL({ dynamic: true })
        });
    },
};