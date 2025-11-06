const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bir kullanıcıyı sunucudan yasaklar')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Yasaklanacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('Yasaklama sebebi')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici');
        const reason = interaction.options.getString('sebep') ?? 'Sebep belirtilmedi';
        
        try {
            await interaction.guild.members.ban(targetUser, { reason });
            await interaction.reply({ 
                content: `${targetUser.tag} kullanıcısı başarıyla yasaklandı!\nSebep: ${reason}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Kullanıcı yasaklanırken bir hata oluştu!', 
                ephemeral: true 
            });
        }
    },
};