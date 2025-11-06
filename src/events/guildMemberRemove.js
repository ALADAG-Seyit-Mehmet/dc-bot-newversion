const { Events } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const joinedAt = Math.floor(member.joinedTimestamp / 1000);

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
    },
};