const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('söyle')
        .setDescription('Yazdığınız mesajı tekrar eder')
        .addStringOption(option =>
            option.setName('mesaj')
                .setDescription('Tekrar edilecek mesaj')
                .setRequired(true)),
    async execute(interaction) {
        const mesaj = interaction.options.getString('mesaj');

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setDescription(mesaj)
            .setColor('#3498db')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};