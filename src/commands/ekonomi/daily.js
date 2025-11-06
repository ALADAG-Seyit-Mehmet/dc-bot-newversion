const { SlashCommandBuilder } = require('discord.js');
const { getUser, createUser, addBalance, setLastDaily } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Günlük ödülünü al (24 saat)')
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        let userData = getUser(userId, guildId);
        if (!userData) userData = createUser(userId, guildId);

        const now = Date.now();
        const lastDaily = Number(userData.last_daily) || 0;
        const dayMs = 24 * 60 * 60 * 1000;

        if (now - lastDaily < dayMs) {
            const remaining = dayMs - (now - lastDaily);
            const hours = Math.floor(remaining / (60*60*1000));
            const minutes = Math.floor((remaining % (60*60*1000)) / (60*1000));
            await interaction.reply({ content: `Günlük ödülünü zaten aldın. Kalan süre: ${hours} saat ${minutes} dakika.`, ephemeral: true });
            return;
        }

        const reward = 500;
        addBalance(userId, guildId, reward);
        setLastDaily(userId, guildId, now);

        await interaction.reply({ content: `Günlük ${reward} Altın ödülünü aldın!`, ephemeral: true });
    }
};