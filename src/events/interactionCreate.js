const { Events, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { sendLogEmbed } = require('../utils/logger');
const config = require('../../config.json');
const fs = require('fs').promises;
const path = require('path');

// Ticket oluşturma işleyicisi
async function handleCreateTicket(interaction) {
    // Bot yetkisi kontrolü
    const botMember = interaction.guild?.members?.me;
    if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await interaction.reply({
            content: '⚠️ Hata: Kanalları yönetme iznim yok! Lütfen yetkilerimi kontrol edin.',
            ephemeral: true
        });
        return;
    }

    try {
        // Destek rolü kontrolü
        if (!config.TICKET_DESTEK_ROLU_ID) {
            throw new Error('TICKET_DESTEK_ROLU_ID config.json dosyasında tanımlanmamış!');
        }

        // Ticket kanalı oluştur
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: interaction.channel.parent,
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // @everyone rolü
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: config.TICKET_DESTEK_ROLU_ID,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
            ],
        });

        const closeButton = new ButtonBuilder()
            .setCustomId('close-ticket')
            .setLabel('Ticket\'ı Kapat')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(closeButton);

        const embed = new EmbedBuilder()
            .setTitle('🎫 Destek Talebi')
            .setDescription(`Merhaba ${interaction.user},\nDestek ekibimiz en kısa sürede sizinle ilgilenecektir.\nTicket'ı kapatmak için aşağıdaki butonu kullanabilirsiniz.`)
            .setColor('#5865F2')
            .setTimestamp();

        await ticketChannel.send({
            content: `${interaction.user} | <@&${config.TICKET_DESTEK_ROLU_ID}>`,
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: `Ticket kanalınız oluşturuldu: ${ticketChannel}`,
            ephemeral: true
        });

        // Log kanalına bilgi gönder
        await sendLogEmbed(interaction.client, {
            title: '🎫 Yeni Ticket Oluşturuldu',
            color: '#5865F2',
            fields: [
                { name: 'Oluşturan', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'Kanal', value: `${ticketChannel.name} (${ticketChannel.id})`, inline: true }
            ],
            thumbnail: interaction.user.displayAvatarURL({ dynamic: true })
        });

    } catch (error) {
        console.error('Ticket oluşturma hatası:', error);
        await interaction.reply({
            content: '❌ Ticket oluşturulurken bir hata oluştu. Lütfen yöneticiye bildirin.',
            ephemeral: true
        });

        // Hata logunu gönder
        await sendLogEmbed(interaction.client, {
            title: '🚨 Ticket Sistemi Hatası',
            color: '#ff0000',
            description: 'Ticket oluşturulurken bir hata meydana geldi.',
            fields: [
                { name: 'Kullanıcı', value: `${interaction.user.tag} (${interaction.user.id})` },
                { name: 'Hata', value: `\`\`\`\n${error.stack || error.message}\n\`\`\`` }
            ]
        });
    }
}

// Ticket kapatma işleyicisi
async function handleCloseTicket(interaction) {
    try {
        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm-close')
            .setLabel('Evet, Kapat')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel-close')
            .setLabel('İptal')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);

        await interaction.reply({
            content: 'Bu ticket\'ı kapatmak istediğinize emin misiniz?',
            components: [row],
            ephemeral: true
        });
    } catch (error) {
        console.error('Ticket kapatma hatası:', error);
        await interaction.reply({
            content: '❌ Ticket kapatma işlemi başlatılırken bir hata oluştu.',
            ephemeral: true
        });
    }
}

// Ticket kapatmayı onayla
async function handleConfirmClose(interaction) {
    try {
        await interaction.reply({
            content: 'Ticket 10 saniye içinde kapatılacak...',
            ephemeral: true
        });

        // Transcript oluştur
        const messages = await interaction.channel.messages.fetch();
        let transcript = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket Transcript</title></head><body>';
        transcript += `<h1>Ticket: ${interaction.channel.name}</h1><div class="messages">`;

        messages.reverse().forEach(msg => {
            transcript += `<div class="message">
                <strong>${msg.author.tag}</strong> [${msg.createdAt.toLocaleString()}]<br>
                ${msg.content}<br>
            </div>`;
        });

        transcript += '</div></body></html>';

        // Transcript dosyasını kaydet
        const transcriptPath = path.join(__dirname, `../../transcript-${interaction.channel.name}.html`);
        await fs.writeFile(transcriptPath, transcript);

        // Log gönder
        await sendLogEmbed(interaction.client, {
            title: '🎫 Ticket Kapatıldı',
            color: '#ff6b6b',
            fields: [
                { name: 'Ticket', value: interaction.channel.name, inline: true },
                { name: 'Kapatan', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
            ],
            thumbnail: interaction.user.displayAvatarURL({ dynamic: true })
        });

        // Transcript'i log kanalına gönder
        if (config.LOG_KANALI_ID) {
            const logChannel = await interaction.client.channels.fetch(config.LOG_KANALI_ID);
            if (logChannel) {
                await logChannel.send({
                    content: `${interaction.channel.name} ticket transkripi:`,
                    files: [transcriptPath]
                });
            }
        }

        // Temizlik ve kapatma
        setTimeout(async () => {
            await fs.unlink(transcriptPath).catch(console.error);
            await interaction.channel.delete().catch(console.error);
        }, 10000);

    } catch (error) {
        console.error('Ticket kapatma onay hatası:', error);
        await interaction.reply({
            content: '❌ Ticket kapatılırken bir hata oluştu.',
            ephemeral: true
        });
    }
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Slash Commands için handler
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`${interaction.commandName} komutu bulunamadı.`);
                return;
            }

            // Critical commands permission map (bot must have these permissions)
            const criticalPermsMap = {
                ban: { perms: [PermissionsBitField.Flags.BanMembers], label: 'Üyeleri Yasakla' },
                kick: { perms: [PermissionsBitField.Flags.KickMembers], label: 'Üyeleri At' },
                mute: { perms: [PermissionsBitField.Flags.ModerateMembers], label: 'Üyeleri Sustur' },
                clear: { perms: [PermissionsBitField.Flags.ManageMessages], label: 'Mesajları Yönet' },
                'ticket-kurulum': { perms: [PermissionsBitField.Flags.ManageChannels], label: 'Kanalları Yönet' }
            };

            try {
                // Bot permission check for critical commands
                const cmdName = interaction.commandName;
                const botMember = interaction.guild?.members?.me;
                if (criticalPermsMap[cmdName] && botMember) {
                    const required = criticalPermsMap[cmdName].perms;
                    if (!botMember.permissions.has(required)) {
                        const permLabel = criticalPermsMap[cmdName].label || required.join(', ');
                        await interaction.reply({ content: `⚠️ Yetki Sorunu! Bu işlemi yapmak için (örn: '${permLabel}') iznine sahip değilim. Lütfen yetkilerimi kontrol edin.`, ephemeral: true });
                        return;
                    }
                }

                await command.execute(interaction);
            } catch (error) {
                // User-friendly ephemeral message
                const userMsg = '❌ Hata! Komutu çalıştırırken beklenmedik bir sorun oluştu. Lütfen daha sonra tekrar deneyin.';
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: userMsg, ephemeral: true });
                    } else {
                        await interaction.reply({ content: userMsg, ephemeral: true });
                    }
                } catch (replyErr) {
                    console.error('Failed to send error reply:', replyErr);
                }

                // Log to console
                console.error(error);

                // Send detailed embed to configured log channel
                try {
                    if (config.LOG_KANALI_ID) {
                        const logChannel = await interaction.client.channels.fetch(config.LOG_KANALI_ID).catch(() => null);
                            const errText = error && error.stack
                                ? `\`\`\`\n${error.stack.substring(0, 1000)}\n\`\`\``
                                : `\`\`\`${String(error).substring(0, 1000)}\`\`\``;

                            const errEmbed = new EmbedBuilder()
                                .setTitle('🚨 SİSTEM HATASI')
                                .setColor('#ff0000')
                                .addFields(
                                    { name: 'Komut', value: `${interaction.commandName}`, inline: true },
                                    { name: 'Kullanıcı', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                                    { name: 'Hata', value: errText }
                                )
                                .setTimestamp();

                        if (logChannel) await logChannel.send({ embeds: [errEmbed] });
                    } else {
                        // Fallback using sendLogEmbed util (which reads config.json internally)
                        await sendLogEmbed(interaction.client, {
                            title: '🚨 SİSTEM HATASI',
                            color: '#ff0000',
                            description: `Komut: ${interaction.commandName}\nKullanıcı: ${interaction.user.tag} (${interaction.user.id})`,
                            fields: [
                                { name: 'Hata (ilk 1000 karakter)', value: `${error && error.stack ? error.stack.substring(0, 1000) : String(error).substring(0, 1000)}` }
                            ]
                        });
                    }
                } catch (logErr) {
                    console.error('Failed to send error embed to log channel:', logErr);
                }
            }
            return;
        }

        // Button interactionları için handler
        if (interaction.isButton()) {
            // Doğrulama butonu
            if (interaction.customId === 'verify-button') {
                try {
                    // Rol ID kontrolü
                    if (!config.DOGRULANMIS_UYE_ROLU_ID) {
                        await interaction.reply({
                            content: '❌ Doğrulanmış üye rolü yapılandırılmamış! Lütfen bir yöneticiye bildirin.',
                            ephemeral: true
                        });
                        return;
                    }

                    const member = interaction.member;

                    // Zaten role sahip mi kontrol et
                    if (member.roles.cache.has(config.DOGRULANMIS_UYE_ROLU_ID)) {
                        await interaction.reply({
                            content: '✅ Zaten doğrulanmış bir üyesin!',
                            ephemeral: true
                        });
                        return;
                    }

                    // Bot'un rol verme yetkisi var mı kontrol et
                    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        await interaction.reply({
                            content: '❌ Bot\'un rol verme yetkisi yok! Lütfen bir yöneticiye bildirin.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Rolü ver
                    await member.roles.add(config.DOGRULANMIS_UYE_ROLU_ID);

                    // Başarılı mesajı gönder
                    await interaction.reply({
                        content: '✅ Başarıyla doğrulandın! Artık sunucuya erişebilirsin.',
                        ephemeral: true
                    });

                    // Log gönder
                    await sendLogEmbed(interaction.client, {
                        title: '✅ Yeni Doğrulanmış Üye',
                        color: '#00FF00',
                        fields: [
                            { name: 'Kullanıcı', value: `${interaction.user.tag} (${interaction.user.id})` }
                        ],
                        thumbnail: interaction.user.displayAvatarURL({ dynamic: true })
                    });

                } catch (error) {
                    console.error('Doğrulama hatası:', error);
                    await interaction.reply({
                        content: '❌ Doğrulama işlemi sırasında bir hata oluştu! Lütfen daha sonra tekrar dene.',
                        ephemeral: true
                    });
                }
                return;
            }

            // Ticket oluşturma butonu
            if (interaction.customId === 'create_ticket') {
                // Ensure bot has ManageChannels permission before creating a channel
                const botMember = interaction.guild?.members?.me;
                if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    await interaction.reply({ content: `⚠️ Yetki Sorunu! Bu işlemi yapmak için (örn: 'Kanalları Yönet') iznine sahip değilim. Lütfen yetkilerimi kontrol edin.`, ephemeral: true });
                    return;
                }

                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: interaction.channel.parent,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: config.TICKET_DESTEK_ROLU_ID,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ],
                });

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Ticket\'ı Kapat')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder()
                    .addComponents(closeButton);

                const embed = new EmbedBuilder()
                    .setTitle('🎫 Destek Talebi')
                    .setDescription(`Merhaba ${interaction.user},\nDestek ekibimiz en kısa sürede sizinle ilgilenecektir.\nTicket'ı kapatmak için aşağıdaki butonu kullanabilirsiniz.`)
                    .setColor('#5865F2')
                    .setTimestamp();

                await ticketChannel.send({
                    content: `${interaction.user} | <@&${config.TICKET_DESTEK_ROLU_ID}>`,
                    embeds: [embed],
                    components: [row]
                });

                await interaction.reply({
                    content: `Ticket kanalınız oluşturuldu: ${ticketChannel}`,
                    ephemeral: true
                });

                // Log kanalına bilgi gönder
                await sendLogEmbed(interaction.client, {
                    title: '🎫 Yeni Ticket Oluşturuldu',
                    color: '#5865F2',
                    fields: [
                        { name: 'Oluşturan', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: 'Kanal', value: `${ticketChannel.name} (${ticketChannel.id})`, inline: true }
                    ],
                    thumbnail: interaction.user.displayAvatarURL({ dynamic: true })
                });
            }
            
            // Ticket kapatma butonu
            if (interaction.customId === 'close_ticket') {
                const confirmButton = new ButtonBuilder()
                    .setCustomId('confirm_close')
                    .setLabel('Evet, Kapat')
                    .setStyle(ButtonStyle.Danger);

                const cancelButton = new ButtonBuilder()
                    .setCustomId('cancel_close')
                    .setLabel('İptal')
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder()
                    .addComponents(confirmButton, cancelButton);

                await interaction.reply({
                    content: 'Bu ticket\'ı kapatmak istediğinize emin misiniz?',
                    components: [row],
                    ephemeral: true
                });
            }

            // Ticket kapatma onay butonu
            if (interaction.customId === 'confirm_close') {
                await interaction.reply({
                    content: 'Ticket 10 saniye içinde kapatılacak...',
                    ephemeral: true
                });

                // Kanal mesajlarını al ve transcript oluştur
                const messages = await interaction.channel.messages.fetch();
                let transcript = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket Transcript</title></head><body>';
                transcript += `<h1>Ticket: ${interaction.channel.name}</h1><div class="messages">`;

                messages.reverse().forEach(msg => {
                    transcript += `<div class="message">
                        <strong>${msg.author.tag}</strong> [${msg.createdAt.toLocaleString()}]<br>
                        ${msg.content}<br>
                    </div>`;
                });

                transcript += '</div></body></html>';

                // Transcript dosyasını oluştur ve log kanalına gönder
                const transcriptPath = path.join(__dirname, `../../transcript-${interaction.channel.name}.html`);
                await fs.writeFile(transcriptPath, transcript);

                // Log kanalına bilgi ve transcript gönder
                await sendLogEmbed(interaction.client, {
                    title: '🎫 Ticket Kapatıldı',
                    color: '#ff6b6b',
                    fields: [
                        { name: 'Ticket', value: interaction.channel.name, inline: true },
                        { name: 'Kapatan', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
                    ],
                    thumbnail: interaction.user.displayAvatarURL({ dynamic: true })
                });

                const logChannel = config.LOG_KANALI_ID ? await interaction.client.channels.fetch(config.LOG_KANALI_ID).catch(() => null) : null;
                if (logChannel) {
                    await logChannel.send({
                        content: `${interaction.channel.name} ticket transkripi:`,
                        files: [transcriptPath]
                    });
                }

                // Transcript dosyasını sil ve kanalı kapat
                setTimeout(async () => {
                    await fs.unlink(transcriptPath);
                    await interaction.channel.delete();
                }, 10000);
            }

            // Ticket kapatma iptal butonu
            if (interaction.customId === 'cancel_close') {
                await interaction.reply({
                    content: 'Ticket kapatma işlemi iptal edildi.',
                    ephemeral: true
                });
            }
        }
    },
};