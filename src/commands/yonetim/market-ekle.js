const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addMarketItem } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market-ekle')
        .setDescription('Markete yeni bir rol ekler')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Markete eklenecek rol')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('fiyat')
                .setDescription('Rolün fiyatı')
                .setRequired(true)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        try {
            const role = interaction.options.getRole('rol');
            const price = interaction.options.getInteger('fiyat');

            // Botun rolü yönetme yetkisi var mı kontrol et
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({
                    content: '❌ Rolleri yönetme yetkim yok!',
                    ephemeral: true
                });
            }

            // Botun rolü, verilecek rolden daha alt seviyede mi kontrol et
            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({
                    content: '❌ Bu rolü veremem çünkü benim en yüksek rolümden daha üst seviyede!',
                    ephemeral: true
                });
            }

            // Role ekle
            await addMarketItem(interaction.guild.id, role.id, price);

            await interaction.reply({
                content: `✅ ${role.name} rolü ${price} 💰 fiyatıyla markete eklendi!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Market rol ekleme hatası:', error);
            await interaction.reply({
                content: '❌ Bir hata oluştu! Lütfen tekrar deneyin.',
                ephemeral: true
            });
        }
    },
};