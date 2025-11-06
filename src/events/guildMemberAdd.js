const { Events } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const createdAt = Math.floor(member.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(member.joinedTimestamp / 1000);

        await sendLogEmbed(member.client, {
            title: '👋 Yeni Üye Katıldı',
            color: '#44ff44',
            fields: [
                { name: 'Kullanıcı', value: `${member.user.tag} (${member.user.id})`, inline: true },
                { name: 'Hesap Oluşturma', value: `<t:${createdAt}:R> (<t:${createdAt}:F>)`, inline: true },
                { name: 'Katılma Zamanı', value: `<t:${joinedAt}:R> (<t:${joinedAt}:F>)`, inline: true }
            ],
            thumbnail: member.user.displayAvatarURL({ dynamic: true })
        });
    },
};