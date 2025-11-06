const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { removeMarketItem, getMarketItem } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market-kaldir')
        .setDescription('Marketten bir rolü kaldırır')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Marketten kaldırılacak rol')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        try {
            const role = interaction.options.getRole('rol');

            // Rol markette var mı kontrol et
            const marketItem = await getMarketItem(role.id);
            if (!marketItem) {
                return interaction.reply({
                    content: '❌ Bu rol zaten markette değil!',
                    ephemeral: true
                });
            }

            // Rolü marketten kaldır
            await removeMarketItem(role.id);

            await interaction.reply({
                content: `✅ ${role.name} rolü marketten kaldırıldı!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Market rol kaldırma hatası:', error);
            await interaction.reply({
                content: '❌ Bir hata oluştu! Lütfen tekrar deneyin.',
                ephemeral: true
            });
        }
    },
};