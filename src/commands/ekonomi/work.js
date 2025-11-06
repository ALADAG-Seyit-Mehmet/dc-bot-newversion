const { SlashCommandBuilder } = require('discord.js');
const { getUser, createUser, addBalance, setLastWork } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Çalış ve altın kazan (1 saat)')
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        let userData = getUser(userId, guildId);
        if (!userData) userData = createUser(userId, guildId);

        const now = Date.now();
        const lastWork = Number(userData.last_work) || 0;
        const hourMs = 60 * 60 * 1000;

        if (now - lastWork < hourMs) {
            const remaining = hourMs - (now - lastWork);
            const minutes = Math.floor(remaining / (60*1000));
            const seconds = Math.floor((remaining % (60*1000)) / 1000);
            await interaction.reply({ content: `Daha yeni çalıştın. Kalan süre: ${minutes} dakika ${seconds} saniye.`, ephemeral: true });
            return;
        }

        const reward = Math.floor(Math.random() * 101) + 50; // 50-150
        addBalance(userId, guildId, reward);
        setLastWork(userId, guildId, now);

        await interaction.reply({ content: `Çalıştın ve **${reward}** Altın kazandın!`, ephemeral: true });
    }
};