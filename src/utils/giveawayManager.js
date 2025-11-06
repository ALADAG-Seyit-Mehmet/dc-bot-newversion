const { EmbedBuilder } = require('discord.js');
const { getActiveGiveaways, endGiveaway } = require('../database');

async function checkGiveaways(client) {
    try {
        const activeGiveaways = await getActiveGiveaways();

        for (const giveaway of activeGiveaways) {
            try {
                // Sunucuyu ve kanalı bul
                const guild = await client.guilds.fetch(giveaway.guild_id);
                if (!guild) continue;

                const channel = await guild.channels.fetch(giveaway.channel_id);
                if (!channel) continue;

                // Çekiliş mesajını bul
                const message = await channel.messages.fetch(giveaway.message_id);
                if (!message) continue;

                // Tepki verenleri topla (bot hariç)
                const reaction = message.reactions.cache.get('🎉');
                if (!reaction) continue;

                // Tüm kullanıcıları çek
                const users = await reaction.users.fetch();
                const validUsers = users.filter(user => !user.bot);

                if (validUsers.size === 0) {
                    // Katılımcı yoksa
                    const noWinnerEmbed = new EmbedBuilder()
                        .setTitle('🎉 ÇEKİLİŞ BİTTİ 🎉')
                        .setColor('#FF0000')
                        .setDescription(
                            `**${giveaway.prize}**\n\n` +
                            `Yeterli katılım olmadığı için kazanan seçilemedi.`
                        )
                        .setTimestamp();

                    await message.edit({ embeds: [noWinnerEmbed] });
                } else {
                    // Kazananları seç
                    const winners = [];
                    const winnerCount = Math.min(giveaway.winner_count, validUsers.size);

                    const userArray = [...validUsers.values()];
                    while (winners.length < winnerCount) {
                        const winner = userArray.splice(Math.floor(Math.random() * userArray.length), 1)[0];
                        winners.push(winner);
                    }

                    // Embed'i güncelle
                    const winnerEmbed = new EmbedBuilder()
                        .setTitle('🎉 ÇEKİLİŞ BİTTİ 🎉')
                        .setColor('#00FF00')
                        .setDescription(
                            `**${giveaway.prize}**\n\n` +
                            `🏆 Kazananlar: ${winners.map(w => `<@${w.id}>`).join(', ')}`
                        )
                        .setTimestamp();

                    await message.edit({ embeds: [winnerEmbed] });

                    // Kazananları duyur
                    await channel.send({
                        content: `🎊 Tebrikler ${winners.map(w => `<@${w.id}>`).join(', ')}! **${giveaway.prize}** kazandınız!`,
                        allowedMentions: { users: winners.map(w => w.id) }
                    });
                }

                // Çekilişi veritabanında bitir
                await endGiveaway(giveaway.message_id);

            } catch (error) {
                console.error(`Çekiliş kontrolü hatası (${giveaway.message_id}):`, error);
                continue;
            }
        }
    } catch (error) {
        console.error('Çekiliş kontrol servisi hatası:', error);
    }
}

module.exports = { checkGiveaways };