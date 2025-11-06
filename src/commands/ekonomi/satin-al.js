const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getMarketItem, getBalance, purchaseItem } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('satin-al')
        .setDescription('Marketten bir rol satın alır')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Satın alınacak rol')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const role = interaction.options.getRole('rol');
            const member = interaction.member;

            // Rol markette var mı kontrol et
            const marketItem = await getMarketItem(role.id);
            if (!marketItem) {
                return interaction.reply({
                    content: '❌ Bu rol markette satılmıyor!',
                    ephemeral: true
                });
            }

            // Kullanıcı zaten bu role sahip mi?
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({
                    content: '❌ Bu role zaten sahipsin!',
                    ephemeral: true
                });
            }

            // Botun rol verme yetkisi ve hiyerarşi kontrolü
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({
                    content: '❌ Rolleri yönetme yetkim yok!',
                    ephemeral: true
                });
            }

            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({
                    content: '❌ Bu rolü veremem çünkü benim en yüksek rolümden daha üst seviyede!',
                    ephemeral: true
                });
            }

            // Kullanıcının bakiyesini kontrol et
            const balance = await getBalance(interaction.user.id, interaction.guild.id);
            if (balance < marketItem.price) {
                return interaction.reply({
                    content: `❌ Yetersiz bakiye! Bu rol için ${marketItem.price} 💰 altına ihtiyacın var. Senin bakiyen: ${balance} 💰`,
                    ephemeral: true
                });
            }

            // Satın alma işlemi
            const result = await purchaseItem(interaction.user.id, interaction.guild.id, marketItem.price);
            if (result.changes === 0) {
                return interaction.reply({
                    content: '❌ Satın alma işlemi başarısız oldu! Bakiyenizi kontrol edin.',
                    ephemeral: true
                });
            }

            // Rolü ver
            await member.roles.add(role);

            await interaction.reply({
                content: `✅ Başarılı! **${role.name}** rolünü ${marketItem.price} 💰 altına satın aldın!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Rol satın alma hatası:', error);
            await interaction.reply({
                content: '❌ Bir hata oluştu! Lütfen tekrar deneyin.',
                ephemeral: true
            });
        }
    },
};