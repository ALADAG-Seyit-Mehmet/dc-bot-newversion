const { Events, PermissionFlagsBits } = require('discord.js');
const { getReactionRole } = require('../database');

module.exports = {
    name: Events.MessageReactionAdd,
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

            // Botun rol verme yetkisi var mı kontrol et
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                console.error('Botun rol verme yetkisi yok!');
                return;
            }

            // Botun rolü, verilecek rolden daha alt seviyede mi kontrol et
            if (role.position >= guild.members.me.roles.highest.position) {
                console.error('Bot bu rolü veremiyor - rol hiyerarşisi engeli');
                return;
            }

            // Rolü ver
            await member.roles.add(role);
            console.log(`${member.user.tag} kullanıcısına ${role.name} rolü verildi.`);

        } catch (error) {
            console.error('Tepki rol verme hatası:', error);
        }
    },
};