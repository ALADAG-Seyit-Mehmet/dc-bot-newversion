const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, createUser, calculateRequiredXP } = require('../../database');

function createProgressBar(current, max, size = 10) {
    const progress = Math.round((current / max) * size);
    const emptyProgress = size - progress;
    
    return '█'.repeat(progress) + '▒'.repeat(emptyProgress);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Seviye bilgilerini gösterir')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Bilgilerini görmek istediğiniz kullanıcı')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici') || interaction.user;
        let userData = getUser(targetUser.id, interaction.guildId);
        
        if (!userData) {
            userData = createUser(targetUser.id, interaction.guildId);
        }

        const nextLevelXP = calculateRequiredXP(userData.level);
        const currentXP = userData.xp;
        const progressBar = createProgressBar(currentXP, nextLevelXP);

        const embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'in Seviye Bilgileri`)
            .setDescription(`🏆 Seviye: **${userData.level}**`)
            .addFields(
                { name: 'Deneyim Puanı', value: `\`${progressBar}\` ${currentXP}/${nextLevelXP} XP`, inline: false },
                { name: 'Toplam XP', value: `${userData.xp}`, inline: true },
                { name: 'Sıradaki Seviye', value: `${userData.level + 1}`, inline: true }
            )
            .setColor('#2ecc71')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};