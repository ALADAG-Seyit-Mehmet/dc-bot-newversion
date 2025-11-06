const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkup')
        .setDescription('Botun sağlık durumunu gösterir (sadece yöneticiler kullanabilir).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            // API gecikmesi
            const apiPing = interaction.client.ws.ping;

            // Uptime (ms -> human)
            const uptimeMs = interaction.client.uptime ?? process.uptime() * 1000;
            const uptimeSec = Math.floor(uptimeMs / 1000);
            const hours = Math.floor(uptimeSec / 3600);
            const minutes = Math.floor((uptimeSec % 3600) / 60);
            const seconds = uptimeSec % 60;
            const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

            // Veritabanı durumu
            let dbStatus = 'Bilinmiyor';
            try {
                const ok = db.ping();
                dbStatus = ok ? 'Bağlantı Başarılı' : 'Bağlantı Başarısız';
            } catch (err) {
                dbStatus = 'Bağlantı Başarısız';
            }

            // Bellek kullanımı
            const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
            const memStr = `${Math.round(heapUsed * 100) / 100} MB`;

            const embed = new EmbedBuilder()
                .setTitle('✅ Bot Sağlık Kontrolü')
                .setColor('#2b2d31')
                .addFields(
                    { name: 'API Gecikmesi', value: `${apiPing} ms`, inline: true },
                    { name: 'Çalışma Süresi', value: `${uptimeStr}`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: 'Veritabanı Durumu', value: dbStatus, inline: true },
                    { name: 'Bellek Kullanımı', value: memStr, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('checkup error:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Hata! Checkup çalıştırılırken bir sorun oluştu.', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Hata! Checkup çalıştırılırken bir sorun oluştu.', ephemeral: true });
            }
        }
    }
};
