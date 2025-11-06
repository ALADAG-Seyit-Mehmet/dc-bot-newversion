const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, createUser, getBalance } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Kullanıcının Altın bakiyesini gösterir')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Bakiyesini görmek istediğiniz kullanıcı')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('kullanici') || interaction.user;
        let userData = getUser(target.id, interaction.guildId);
        if (!userData) userData = createUser(target.id, interaction.guildId);

        const balance = userData.balance ?? 0;

        const embed = new EmbedBuilder()
            .setTitle(`${target.username} - Altın Bakiyesi`)
            .setDescription(`💰 **${balance}** Altın`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setColor('#f1c40f')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};