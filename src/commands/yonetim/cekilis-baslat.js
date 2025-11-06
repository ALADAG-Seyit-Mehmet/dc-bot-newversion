const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createGiveaway } = require('../../database');

// Süre formatını milisaniyeye çeviren yardımcı fonksiyon
function parseDuration(duration) {
    const match = duration.match(/^(\d+)(m|h|d)$/);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 'm': return amount * 60 * 1000; // dakika
        case 'h': return amount * 60 * 60 * 1000; // saat
        case 'd': return amount * 24 * 60 * 60 * 1000; // gün
        default: return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cekilis-baslat')
        .setDescription('Yeni bir çekiliş başlatır')
        .addStringOption(option =>
            option.setName('süre')
                .setDescription('Çekiliş süresi (örn: 1h, 30m, 2d)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('kazanan_sayisi')
                .setDescription('Kaç kişi kazanacak?')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10))
        .addStringOption(option =>
            option.setName('ödül')
                .setDescription('Çekilişin ödülü')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        try {
            const durationStr = interaction.options.getString('süre');
            const winnerCount = interaction.options.getInteger('kazanan_sayisi');
            const prize = interaction.options.getString('ödül');

            // Süreyi kontrol et
            const duration = parseDuration(durationStr);
            if (!duration) {
                return interaction.reply({
                    content: '❌ Geçersiz süre formatı! Örnek: 1h (1 saat), 30m (30 dakika), 2d (2 gün)',
                    ephemeral: true
                });
            }

            // Bitiş zamanını hesapla
            const endTime = new Date(Date.now() + duration);

            // Çekiliş embed'ini oluştur
            const giveawayEmbed = new EmbedBuilder()
                .setTitle('🎉 ÇEKİLİŞ BAŞLADI 🎉')
                .setColor('#FF69B4')
                .setDescription(
                    `**${prize}**\n\n` +
                    `Kazanmak için 🎉 tepkisine tıkla!\n\n` +
                    `• Kazanan Sayısı: ${winnerCount}\n` +
                    `• Bitiş: <t:${Math.floor(endTime.getTime() / 1000)}:R>\n`
                )
                .setTimestamp(endTime);

            // Çekiliş mesajını gönder
            const giveawayMessage = await interaction.channel.send({ embeds: [giveawayEmbed] });
            await giveawayMessage.react('🎉');

            // Veritabanına kaydet
            await createGiveaway(
                giveawayMessage.id,
                interaction.guild.id,
                interaction.channel.id,
                endTime.toISOString(),
                winnerCount,
                prize
            );

            await interaction.reply({
                content: '✅ Çekiliş başarıyla başlatıldı!',
                ephemeral: true
            });

        } catch (error) {
            console.error('Çekiliş başlatma hatası:', error);
            await interaction.reply({
                content: '❌ Çekiliş başlatılırken bir hata oluştu!',
                ephemeral: true
            });
        }
    },
};
