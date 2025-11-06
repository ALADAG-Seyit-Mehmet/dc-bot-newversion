const { Events, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');
const {
    checkSpam,
    containsBadWords,
    containsUnsafeLinks,
    checkAndIncrementViolations,
    determineModReason
} = require('../utils/automod');
const {
    getUser,
    createUser,
    addXP,
    setLevel,
    checkLevelUp
} = require('../database');

// XP cooldown için Set
const xpCooldown = new Set();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Bot mesajlarını ve DM'leri yoksay
        if (message.author.bot || !message.guild) return;

        // Yönetici izni olanları yoksay
        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        // Link paylaşabilir rolü varsa link kontrolünü atla
        const canShareLinks = message.member.roles.cache.some(role => 
            role.name.toLowerCase() === 'link paylaşabilir'
        );

        let shouldDelete = false;
        let reason = '';

        // Mesaj içeriğini kontrol et
        if (containsBadWords(message.content)) {
            shouldDelete = true;
            reason = 'küfür/hakaret';
        } else if (!canShareLinks && containsUnsafeLinks(message.content)) {
            shouldDelete = true;
            reason = 'güvensiz link';
        } else if (checkSpam(message.author.id, message.content, Date.now())) {
            shouldDelete = true;
            reason = 'spam/flood';
        }

        if (shouldDelete) {
            // Mesajı sil
            try {
                await message.delete();
            } catch (error) {
                console.error('Mesaj silinirken hata:', error);
                return;
            }

            // İhlal sayısını kontrol et
            const violationCount = checkAndIncrementViolations(message.author.id);

            // Kullanıcıya DM gönder
            try {
                await message.author.send(
                    `Sunucumuzda **${reason}** nedeniyle mesajınız silindi. Lütfen kurallara uyun.\n` +
                    `Bu sizin son ${violationCount} dakika içindeki ${violationCount}. ihlaliniz.`
                );
            } catch (error) {
                console.error('DM gönderilirken hata:', error);
            }

            // Log kanalına bildir
            await sendLogEmbed(message.client, {
                title: '🛡️ Auto-Mod: Mesaj Silindi',
                color: '#ff6b6b',
                fields: [
                    { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Kanal', value: `${message.channel.name} (${message.channel.id})`, inline: true },
                    { name: 'Sebep', value: reason, inline: true },
                    { name: 'İhlal Sayısı', value: `Son 10 dk içinde: ${violationCount}`, inline: true },
                    { name: 'Mesaj İçeriği', value: message.content.length > 1024 ? message.content.slice(0, 1021) + '...' : message.content }
                ],
                thumbnail: message.author.displayAvatarURL({ dynamic: true })
            });

            // 3 ihlal durumunda timeout uygula
            if (violationCount >= 3) {
                try {
                    await message.member.timeout(600000, 'Çok sayıda AutoMod ihlali'); // 10 dakika
                    await sendLogEmbed(message.client, {
                        title: '🛡️ Auto-Mod: Timeout Uygulandı',
                        color: '#e74c3c',
                        fields: [
                            { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})` },
                            { name: 'Süre', value: '10 dakika' },
                            { name: 'Sebep', value: 'Son 10 dakika içinde 3 veya daha fazla AutoMod ihlali' }
                        ],
                        thumbnail: message.author.displayAvatarURL({ dynamic: true })
                    });
                } catch (error) {
                    console.error('Timeout uygulanırken hata:', error);
                }
            }
        }

        // Seviye sistemi
        // Bot mesajlarını, komutları ve DM'leri yoksay
        if (message.author.bot || message.content.startsWith('/') || !message.guild) return;

        // XP cooldown kontrolü
        if (xpCooldown.has(`${message.author.id}-${message.guild.id}`)) return;

        // Kullanıcı verilerini al veya oluştur
        let userData = getUser(message.author.id, message.guild.id);
        if (!userData) {
            userData = createUser(message.author.id, message.guild.id);
        }

        // Rastgele XP ekle (15-25 arası)
        const earnedXP = Math.floor(Math.random() * 11) + 15;
        addXP(message.author.id, message.guild.id, earnedXP);
        userData.xp += earnedXP;

        // Seviye atlama kontrolü
        if (checkLevelUp(userData.xp, userData.level)) {
            const newLevel = userData.level + 1;
            setLevel(message.author.id, message.guild.id, newLevel);

            const levelUpEmbed = new EmbedBuilder()
                .setTitle('🎉 Seviye Atladın!')
                .setDescription(`Tebrikler ${message.author}! **${newLevel}** seviyesine ulaştın!`)
                .setColor('#2ecc71')
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await message.channel.send({ embeds: [levelUpEmbed] });
        }

        // XP cooldown ekle (60 saniye)
        xpCooldown.add(`${message.author.id}-${message.guild.id}`);
        setTimeout(() => {
            xpCooldown.delete(`${message.author.id}-${message.guild.id}`);
        }, 60000);
    },
};