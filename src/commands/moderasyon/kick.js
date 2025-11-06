const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Bir kullanıcıyı sunucudan atar')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Atılacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('Atılma sebebi')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici');
        const reason = interaction.options.getString('sebep') ?? 'Sebep belirtilmedi';
        
        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            await member.kick(reason);
            await interaction.reply({ 
                content: `${targetUser.tag} kullanıcısı başarıyla atıldı!\nSebep: ${reason}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Kullanıcı atılırken bir hata oluştu!', 
                ephemeral: true 
            });
        }
    },
};