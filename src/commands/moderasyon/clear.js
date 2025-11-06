const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Belirtilen sayıda mesajı siler')
        .addIntegerOption(option =>
            option.setName('miktar')
                .setDescription('Silinecek mesaj sayısı (en fazla 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('miktar');
        
        try {
            const messages = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ 
                content: `${messages.size} mesaj başarıyla silindi!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Mesajlar silinirken bir hata oluştu! Not: 14 günden eski mesajlar silinemez.', 
                ephemeral: true 
            });
        }
    },
};