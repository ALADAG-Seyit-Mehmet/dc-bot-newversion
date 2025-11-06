const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zar-at')
        .setDescription('1 ile 6 arasında rastgele bir sayı seçer'),
    async execute(interaction) {
        const sonuc = Math.floor(Math.random() * 6) + 1;
        const zarEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

        const embed = new EmbedBuilder()
            .setTitle('🎲 Zar Atıldı')
            .setDescription(`${zarEmojis[sonuc-1]} Zar: **${sonuc}** geldi!`)
            .setColor('#9b59b6')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};