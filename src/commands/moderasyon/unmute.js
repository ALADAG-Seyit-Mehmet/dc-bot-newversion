const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Bir kullanıcının susturmasını kaldırır')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Susturması kaldırılacak kullanıcı')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici');
        
        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            await member.timeout(null);
            await interaction.reply({ 
                content: `${targetUser.tag} kullanıcısının susturması kaldırıldı!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Kullanıcının susturması kaldırılırken bir hata oluştu!', 
                ephemeral: true 
            });
        }
    },
};