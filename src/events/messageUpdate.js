const { Events } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        await sendLogEmbed(oldMessage.client, {
            title: '✏️ Mesaj Düzenlendi',
            color: '#ffa500',
            fields: [
                { name: 'Yazar', value: `${oldMessage.author?.tag || 'Bilinmiyor'} (${oldMessage.author?.id || 'Bilinmiyor'})`, inline: true },
                { name: 'Kanal', value: `${oldMessage.channel.name} (<#${oldMessage.channel.id}>)`, inline: true },
                { name: 'Eski Mesaj', value: oldMessage.content || 'İçerik yok' },
                { name: 'Yeni Mesaj', value: newMessage.content || 'İçerik yok' },
                { name: 'Mesaja Git', value: `[Tıkla](${newMessage.url})` }
            ],
            thumbnail: oldMessage.author?.displayAvatarURL({ dynamic: true })
        });
    },
};