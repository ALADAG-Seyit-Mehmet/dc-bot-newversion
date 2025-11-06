const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addReactionRole } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tepki-rol-ekle')
        .setDescription('Bir mesaja tepki-rol bağlantısı ekler')
        .addStringOption(option =>
            option.setName('mesaj_id')
                .setDescription('Tepki eklenecek mesajın ID\'si')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Kullanılacak emoji')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Verilecek rol')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        try {
            const messageId = interaction.options.getString('mesaj_id');
            const emoji = interaction.options.getString('emoji');
            const role = interaction.options.getRole('rol');

            // Botun rolü yönetme yetkisi var mı kontrol et
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({
                    content: '❌ Rolleri yönetme yetkim yok!',
                    ephemeral: true
                });
            }

            // Botun rolü, verilecek rolden daha alt seviyede mi kontrol et
            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({
                    content: '❌ Bu rolü veremem çünkü benim en yüksek rolümden daha üst seviyede!',
                    ephemeral: true
                });
            }

            // Mesajı bul
            const channel = interaction.channel;
            const targetMessage = await channel.messages.fetch(messageId).catch(() => null);
            
            if (!targetMessage) {
                return interaction.reply({
                    content: '❌ Belirtilen mesaj bu kanalda bulunamadı!',
                    ephemeral: true
                });
            }

            // Emoji kontrolü
            let parsedEmoji;
            if (emoji.match(/^<a?:.+:\d+>$/)) {
                // Özel emoji
                const emojiId = emoji.match(/\d+/)[0];
                parsedEmoji = interaction.client.emojis.cache.get(emojiId);
                if (!parsedEmoji) {
                    return interaction.reply({
                        content: '❌ Bu özel emojiyi kullanamıyorum!',
                        ephemeral: true
                    });
                }
            } else {
                // Unicode emoji
                parsedEmoji = emoji;
            }

            // Mesaja tepki ekle
            await targetMessage.react(parsedEmoji);

            // Veritabanına kaydet
            const emojiIdentifier = parsedEmoji.id || parsedEmoji;
            await addReactionRole(messageId, emojiIdentifier, role.id);

            await interaction.reply({
                content: '✅ Tepki rolü başarıyla ayarlandı!',
                ephemeral: true
            });

        } catch (error) {
            console.error('Tepki rol ekleme hatası:', error);
            await interaction.reply({
                content: '❌ Bir hata oluştu! Lütfen tekrar deneyin.',
                ephemeral: true
            });
        }
    },
};