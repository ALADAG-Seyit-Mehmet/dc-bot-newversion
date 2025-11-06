const { Events } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');
const { updateStats } = require('../utils/updateStats');
const config = require('../../config.json');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const joinedAt = Math.floor(member.joinedTimestamp / 1000);

        // Log kanalına detaylı bilgi gönder
        await sendLogEmbed(member.client, {
            title: '👋 Üye Ayrıldı',
            color: '#ff6b6b',
            fields: [
                { name: 'Kullanıcı', value: `${member.user.tag} (${member.user.id})`, inline: true },
                { name: 'Katılma Tarihi', value: `<t:${joinedAt}:R> (<t:${joinedAt}:F>)`, inline: true },
                { name: 'Roller', value: member.roles.cache.filter(role => role.id !== member.guild.id).map(role => `<@&${role.id}>`).join(', ') || 'Rol yok' }
            ],
            thumbnail: member.user.displayAvatarURL({ dynamic: true })
        });

        // Ayrılma kanalına mesaj gönder
        if (config.AYRILMA_KANALI_ID) {
            try {
                const leaveChannel = await member.guild.channels.fetch(config.AYRILMA_KANALI_ID);
                if (leaveChannel) {
                    const leaveMessage = config.AYRILMA_MESAJI
                        .replace('{kullaniciAdi}', member.user.tag);

                    await leaveChannel.send(leaveMessage);
                }
            } catch (error) {
                console.error('Ayrılma mesajı gönderilemedi:', error);
            }
        }

        // İstatistikleri güncelle
        await updateStats(member.guild);
    },
};