const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dogrulama-kurulum')
        .setDescription('Doğrulama sistemini belirtilen kanala kurar')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Doğrulama mesajının gönderileceği kanal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('kanal');

            // Rol ID'si kontrol et
            if (!config.DOGRULANMIS_UYE_ROLU_ID) {
                return interaction.reply({
                    content: '❌ config.json dosyasında DOGRULANMIS_UYE_ROLU_ID ayarlanmamış!',
                    ephemeral: true
                });
            }

            // Embed mesajı oluştur
            const verifyEmbed = new EmbedBuilder()
                .setTitle('Sunucumuza hoş geldin!')
                .setDescription('Lütfen kuralları okuduğunu ve kabul ettiğini onaylamak için aşağıdaki \'Doğrula\' butonuna tıkla. Bu işlemden sonra sunucunun geri kalanına erişebileceksin.')
                .setColor('#2ECC71')
                .setTimestamp();

            // Doğrulama butonunu oluştur
            const verifyButton = new ButtonBuilder()
                .setCustomId('verify-button')
                .setLabel('✅ Doğrula')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
                .addComponents(verifyButton);

            // Mesajı gönder
            await channel.send({
                embeds: [verifyEmbed],
                components: [row]
            });

            await interaction.reply({
                content: '✅ Doğrulama sistemi başarıyla kuruldu!',
                ephemeral: true
            });

        } catch (error) {
            console.error('Doğrulama kurulum hatası:', error);
            await interaction.reply({
                content: '❌ Doğrulama sistemi kurulurken bir hata oluştu!',
                ephemeral: true
            });
        }
    },
};