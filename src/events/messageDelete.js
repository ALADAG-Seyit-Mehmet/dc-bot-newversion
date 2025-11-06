const { Events } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (message.author?.bot) return;

        await sendLogEmbed(message.client, {
            title: '📝 Mesaj Silindi',
            color: '#ff4444',
            fields: [
                { name: 'Yazar', value: `${message.author?.tag || 'Bilinmiyor'} (${message.author?.id || 'Bilinmiyor'})`, inline: true },
                { name: 'Kanal', value: `${message.channel.name} (<#${message.channel.id}>)`, inline: true },
                { name: 'Mesaj İçeriği', value: message.content || 'İçerik yok' }
            ],
            thumbnail: message.author?.displayAvatarURL({ dynamic: true })
        });
    },
};