const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

async function sendLogEmbed(client, { title, description, fields, color, thumbnail, author }) {
    try {
        if (!config.LOG_KANALI_ID) return;
        const logChannel = await client.channels.fetch(config.LOG_KANALI_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color || '#2b2d31')
            .setTimestamp();

        if (fields) embed.addFields(fields);
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (author) embed.setAuthor(author);

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('sendLogEmbed error:', err);
    }
}

module.exports = { sendLogEmbed };