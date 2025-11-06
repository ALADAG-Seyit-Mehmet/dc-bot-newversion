const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function getRandomChoice() {
    const choices = ['taş', 'kağıt', 'makas'];
    return choices[Math.floor(Math.random() * choices.length)];
}

function getWinner(player, bot) {
    if (player === bot) return 'berabere';
    if (
        (player === 'taş' && bot === 'makas') ||
        (player === 'kağıt' && bot === 'taş') ||
        (player === 'makas' && bot === 'kağıt')
    ) return 'oyuncu';
    return 'bot';
}

const emojis = {
    taş: '🪨',
    kağıt: '📄',
    makas: '✂️',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taş-kağıt-makas')
        .setDescription('Bot ile taş kağıt makas oyna'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tkm_taş')
                    .setLabel('Taş')
                    .setEmoji('🪨')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('tkm_kağıt')
                    .setLabel('Kağıt')
                    .setEmoji('📄')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('tkm_makas')
                    .setLabel('Makas')
                    .setEmoji('✂️')
                    .setStyle(ButtonStyle.Primary),
            );

        const embed = new EmbedBuilder()
            .setTitle('🎮 Taş Kağıt Makas')
            .setDescription('Seçiminizi yapın!')
            .setColor('#2ecc71')
            .setTimestamp();

        const message = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        const filter = i => i.user.id === interaction.user.id && i.customId.startsWith('tkm_');
        const collector = message.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            const playerChoice = i.customId.replace('tkm_', '');
            const botChoice = getRandomChoice();
            const winner = getWinner(playerChoice, botChoice);

            let resultText = `**Seçimler:**\n`;
            resultText += `${interaction.user.username}: ${emojis[playerChoice]} ${playerChoice}\n`;
            resultText += `Bot: ${emojis[botChoice]} ${botChoice}\n\n`;

            switch(winner) {
                case 'oyuncu':
                    resultText += '🎉 **Kazandınız!**';
                    break;
                case 'bot':
                    resultText += '😢 **Kaybettiniz!**';
                    break;
                case 'berabere':
                    resultText += '🤝 **Berabere!**';
                    break;
            }

            const resultEmbed = new EmbedBuilder()
                .setTitle('🎮 Taş Kağıt Makas - Sonuç')
                .setDescription(resultText)
                .setColor(winner === 'oyuncu' ? '#2ecc71' : winner === 'bot' ? '#e74c3c' : '#f1c40f')
                .setTimestamp();

            await i.update({
                embeds: [resultEmbed],
                components: []
            });
            collector.stop();
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('🎮 Taş Kağıt Makas')
                    .setDescription('❌ Süre doldu! Seçim yapmadınız.')
                    .setColor('#95a5a6')
                    .setTimestamp();

                await message.edit({
                    embeds: [timeoutEmbed],
                    components: []
                });
            }
        });
    },
};