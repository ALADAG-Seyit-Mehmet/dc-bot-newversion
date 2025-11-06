const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getMarketItems } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Marketteki rolleri ve fiyatlarını listeler'),

    async execute(interaction) {
        try {
            const items = await getMarketItems(interaction.guild.id);

            if (items.length === 0) {
                return interaction.reply({
                    content: '❌ Markette henüz hiç rol bulunmuyor.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🛍️ Rol Marketi')
                .setDescription('Rol satın almak için `/satin-al` komutunu kullanın!')
                .setTimestamp();

            // Rolleri embed'e ekle
            for (const item of items) {
                const role = await interaction.guild.roles.fetch(item.role_id);
                if (role) {
                    embed.addFields({
                        name: role.name,
                        value: `💰 ${item.price} altın`,
                        inline: true
                    });
                }
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Market listeleme hatası:', error);
            await interaction.reply({
                content: '❌ Bir hata oluştu! Lütfen tekrar deneyin.',
                ephemeral: true
            });
        }
    },
};