const { SlashCommandBuilder } = require('discord.js');
const { getUser, createUser, getBalance, transferBalance } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Başka bir kullanıcıya Altın gönder')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Göndermek istediğiniz kullanıcı')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('miktar')
                .setDescription('Gönderilecek miktar')
                .setRequired(true)),
    async execute(interaction) {
        const fromId = interaction.user.id;
        const toUser = interaction.options.getUser('kullanici');
        const amount = interaction.options.getInteger('miktar');
        const guildId = interaction.guildId;

        if (amount <= 0) return interaction.reply({ content: 'Miktar pozitif bir sayı olmalıdır.', ephemeral: true });
        if (toUser.id === fromId) return interaction.reply({ content: 'Kendine para gönderemezsin.', ephemeral: true });

        let fromData = getUser(fromId, guildId);
        if (!fromData) fromData = createUser(fromId, guildId);
        let toData = getUser(toUser.id, guildId);
        if (!toData) toData = createUser(toUser.id, guildId);

        const fromBalance = fromData.balance ?? 0;
        if (fromBalance < amount) return interaction.reply({ content: 'Yetersiz bakiye.', ephemeral: true });

        try {
            transferBalance(fromId, toUser.id, guildId, amount);
            await interaction.reply({ content: `Başarılı! ${toUser.username} kullanıcısına ${amount} Altın gönderdin.`, ephemeral: true });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Transfer sırasında bir hata oluştu.', ephemeral: true });
        }
    }
};