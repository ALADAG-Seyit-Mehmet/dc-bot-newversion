const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function parseTime(timeString) {
    const timeRegex = /^(\d+)(m|h|d)$/;
    const match = timeString.match(timeRegex);
    
    if (!match) return null;
    
    const [, amount, unit] = match;
    const milliseconds = {
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000
    }[unit];
    
    return parseInt(amount) * milliseconds;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Bir kullanıcıyı belirli süre susturur')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Susturulacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('sure')
                .setDescription('Susturma süresi (örn: 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('Susturma sebebi')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici');
        const duration = interaction.options.getString('sure');
        const reason = interaction.options.getString('sebep') ?? 'Sebep belirtilmedi';
        
        const timeInMs = parseTime(duration);
        if (!timeInMs) {
            return interaction.reply({ 
                content: 'Geçersiz süre formatı! Örnek: 10m, 1h, 1d', 
                ephemeral: true 
            });
        }
        
        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            await member.timeout(timeInMs, reason);
            await interaction.reply({ 
                content: `${targetUser.tag} kullanıcısı ${duration} süreyle susturuldu!\nSebep: ${reason}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Kullanıcı susturulurken bir hata oluştu!', 
                ephemeral: true 
            });
        }
    },
};