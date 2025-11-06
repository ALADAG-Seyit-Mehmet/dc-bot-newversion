const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temizle')
        .setDescription('Belirtilen sayıda mesajı siler')
        .addIntegerOption(option =>
            option.setName('miktar')
                .setDescription('Silinecek mesaj sayısı')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('miktar');

        try {
            await interaction.channel.bulkDelete(amount);
            await interaction.reply({ content: `${amount} mesaj başarıyla silindi!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Mesajları silerken bir hata oluştu!', ephemeral: true });
        }
    },
};