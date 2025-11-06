const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-kurulum')
        .setDescription('Ticket sistemini kurar')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Ticket oluşturma mesajının gönderileceği kanal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');

        const embed = new EmbedBuilder()
            .setTitle('🎫 Destek Talebi Oluştur')
            .setDescription('Destek ekibimizle görüşmek için aşağıdaki butona tıklayarak bir ticket oluşturabilirsiniz.')
            .setColor('#5865F2')
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const button = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Ticket Oluştur')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: 'Ticket sistemi başarıyla kuruldu!',
            ephemeral: true
        });
    },
};