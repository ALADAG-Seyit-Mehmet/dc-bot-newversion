const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getRichList } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('richlist')
        .setDescription('Sunucudaki en zengin 10 kullanıcıyı gösterir'),
    async execute(interaction) {
        const list = getRichList(interaction.guildId, 10);
        if (!list || list.length === 0) return interaction.reply({ content: 'Henüz kimse zengin değil 😅', ephemeral: true });

        let desc = '';
        for (let i = 0; i < list.length; i++) {
            const entry = list[i];
            const user = await interaction.client.users.fetch(entry.user_id).catch(() => null);
            if (!user) continue;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
            desc += `${medal} ${user.username} • **${entry.balance}** Altın\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`💰 ${interaction.guild.name} Zenginler Listesi`)
            .setDescription(desc)
            .setColor('#f39c12')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};