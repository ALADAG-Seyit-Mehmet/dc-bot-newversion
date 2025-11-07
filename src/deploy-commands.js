const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`${commands.length} adet komut yükleniyor...`);

        // Helper: retry REST put on transient network/TLS errors (ECONNRESET etc.)
        async function putWithRetries(route, body, maxAttempts = 3) {
            let attempt = 0;
            while (true) {
                attempt++;
                try {
                    return await rest.put(route, { body });
                } catch (err) {
                    const code = err && err.code ? err.code : err && err.name ? err.name : String(err);
                    console.error(`REST PUT failed (attempt ${attempt}): ${code}`);
                    // If last attempt, rethrow full error
                    if (attempt >= maxAttempts) {
                        console.error('Max retry attempts reached. Throwing error.');
                        throw err;
                    }
                    // For transient errors, wait using exponential backoff
                    const delay = Math.pow(2, attempt) * 1000; // 2^attempt seconds
                    console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // If GUILD_ID is present deploy to that guild (instant). Otherwise deploy globally (can take up to 1 hour).
        let data;
        if (process.env.GUILD_ID) {
            console.log('GUILD_ID bulundu, komutlar belirtilen sunucuya (guild) yüklenecek...');
            data = await putWithRetries(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                commands,
            );
        } else {
            console.log('GUILD_ID yok — komutlar global olarak yüklenecek (yayılma ~1 saat sürebilir)...');
            data = await putWithRetries(
                Routes.applicationCommands(process.env.CLIENT_ID),
                commands,
            );
        }

        console.log(`${data.length} adet komut başarıyla yüklendi!`);
    } catch (error) {
        console.error(error);
    }
})();