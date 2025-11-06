const { Events, PermissionFlagsBits } = require('discord.js');
const { getReactionRole } = require('../database');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        // Bot tepkilerini yoksay
        if (user.bot) return;

        // Partial tepki ise fetch
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Tepki fetch hatası:', error);
                return;
            }
        }

        try {
            // Emoji ID veya unicode'unu al
            const emojiIdentifier = reaction.emoji.id || reaction.emoji.name;
            
            // Veritabanından tepki-rol eşleşmesini kontrol et
            const reactionRole = await getReactionRole(reaction.message.id, emojiIdentifier);
            
            if (!reactionRole) return; // Eşleşme yoksa çık

            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);
            const role = await guild.roles.fetch(reactionRole.role_id);

            if (!role) {
                console.error('Rol bulunamadı:', reactionRole.role_id);
                return;
            }

            // Botun rol alma yetkisi var mı kontrol et
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                console.error('Botun rol alma yetkisi yok!');
                return;
            }

            // Botun rolü, alınacak rolden daha alt seviyede mi kontrol et
            if (role.position >= guild.members.me.roles.highest.position) {
                console.error('Bot bu rolü alamıyor - rol hiyerarşisi engeli');
                return;
            }

            // Rolü al
            await member.roles.remove(role);
            console.log(`${member.user.tag} kullanıcısından ${role.name} rolü alındı.`);

        } catch (error) {
            console.error('Tepki rol alma hatası:', error);
        }
    },
};