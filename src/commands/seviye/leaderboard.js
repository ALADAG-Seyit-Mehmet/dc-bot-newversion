const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Sunucunun liderlik tablosunu gösterir'),
    async execute(interaction) {
        const leaderboard = getLeaderboard(interaction.guildId);
        
        if (leaderboard.length === 0) {
            return interaction.reply({
                content: 'Henüz hiç seviye verisi yok!',
                ephemeral: true
            });
        }

        let description = '';
        for (let i = 0; i < leaderboard.length; i++) {
            const user = await interaction.client.users.fetch(leaderboard[i].user_id).catch(() => null);
            if (user) {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                description += `${medal} ${user.username} • Seviye: ${leaderboard[i].level} • XP: ${leaderboard[i].xp}\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`🏆 ${interaction.guild.name} Liderlik Tablosu`)
            .setDescription(description)
            .setColor('#ffd700')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};