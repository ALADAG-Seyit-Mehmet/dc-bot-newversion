const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yazı-tura')
        .setDescription('Yazı tura atar'),
    async execute(interaction) {
        const sonuc = Math.random() < 0.5 ? 'Yazı' : 'Tura';
        const emoji = sonuc === 'Yazı' ? '📝' : '🪙';

        const embed = new EmbedBuilder()
            .setTitle(`${emoji} Yazı Tura`)
            .setDescription(`Para döndü ve...\n\n**${sonuc}** geldi!`)
            .setColor(sonuc === 'Yazı' ? '#3498db' : '#f1c40f')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};