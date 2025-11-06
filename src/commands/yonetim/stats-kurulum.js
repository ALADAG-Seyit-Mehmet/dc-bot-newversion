const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats-kurulum')
        .setDescription('Sunucu istatistik kanallarını kurar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Kategori oluşturma
            const category = await interaction.guild.channels.create({
                name: '📊 SUNUCU İSTATİSTİKLERİ',
                type: 4, // CategoryChannel
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.Connect]
                    }
                ]
            });

            // İstatistik kanallarını oluşturma
            const totalChannel = await interaction.guild.channels.create({
                name: 'Toplam Üye: ?',
                type: 2, // VoiceChannel
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.Connect]
                    }
                ]
            });

            const onlineChannel = await interaction.guild.channels.create({
                name: 'Çevrimiçi: ?',
                type: 2,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.Connect]
                    }
                ]
            });

            const botChannel = await interaction.guild.channels.create({
                name: 'Botlar: ?',
                type: 2,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.Connect]
                    }
                ]
            });

            // Config dosyasını güncelleme
            const configPath = path.join(__dirname, '../../../config.json');
            const config = require(configPath);

            config.STATS_CATEGORY_ID = category.id;
            config.STATS_TOTAL_ID = totalChannel.id;
            config.STATS_ONLINE_ID = onlineChannel.id;
            config.STATS_BOT_ID = botChannel.id;

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            // Stats güncelleme fonksiyonunu çağırma
            const { updateStats } = require('../../utils/updateStats.js');
            await updateStats(interaction.guild);

            await interaction.editReply('İstatistik kanalları başarıyla oluşturuldu ve yapılandırıldı! ✅');
        } catch (error) {
            console.error('Stats kurulum hatası:', error);
            await interaction.editReply('İstatistik kanalları oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },
};