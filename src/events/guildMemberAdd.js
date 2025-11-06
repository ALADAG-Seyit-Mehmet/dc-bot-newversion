const { Events, EmbedBuilder } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');
const { updateStats } = require('../utils/updateStats');
const config = require('../../config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const createdAt = Math.floor(member.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(member.joinedTimestamp / 1000);

        // Log kanalına bilgi gönder
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

        // Hoşgeldin mesajını gönder
        if (config.HOSGELDIN_KANALI_ID) {
            try {
                const welcomeChannel = await member.guild.channels.fetch(config.HOSGELDIN_KANALI_ID);
                if (welcomeChannel) {
                    const welcomeEmbed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('🎉 Yeni Üye!')
                        .setDescription(
                            config.HOSGELDIN_MESAJI
                                .replace('{kullanici}', `<@${member.id}>`)
                                .replace('{uyeSayisi}', member.guild.memberCount)
                        )
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();

                    await welcomeChannel.send({ embeds: [welcomeEmbed] });
                }
            } catch (error) {
                console.error('Hoşgeldin mesajı gönderilemedi:', error);
            }
        }

        // Yeni üye rolü ver
        if (config.YENI_UYE_ROLU_ID) {
            try {
                await member.roles.add(config.YENI_UYE_ROLU_ID);
            } catch (error) {
                console.error('Yeni üye rolü verilemedi:', error);
            }
        }

        // İstatistikleri güncelle
        await updateStats(member.guild);
    },
};