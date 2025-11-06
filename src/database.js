const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'levels.db'));

// Tablolar oluştur
db.exec(`
    CREATE TABLE IF NOT EXISTS kullanicilar (
        user_id TEXT,
        guild_id TEXT,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        balance INTEGER DEFAULT 0,
        last_daily TEXT DEFAULT '0',
        last_work TEXT DEFAULT '0',
        PRIMARY KEY (user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS tepki_rolleri (
        message_id TEXT,
        emoji TEXT,
        role_id TEXT,
        PRIMARY KEY (message_id, emoji)
    );

    CREATE TABLE IF NOT EXISTS market_items (
        guild_id TEXT,
        role_id TEXT,
        price INTEGER,
        PRIMARY KEY (role_id)
    );

    CREATE TABLE IF NOT EXISTS giveaways (
        message_id TEXT PRIMARY KEY,
        guild_id TEXT,
        channel_id TEXT,
        end_time TEXT,
        winner_count INTEGER,
        prize TEXT,
        is_ended BOOLEAN DEFAULT 0
    );
`);

// Eğer eski tablolarda yeni sütunlar yoksa ekle (ALTER TABLE kullanalım)
const existingCols = db.prepare("PRAGMA table_info(kullanicilar)").all();
const colNames = existingCols.map(c => c.name);
if (!colNames.includes('balance')) {
    db.prepare("ALTER TABLE kullanicilar ADD COLUMN balance INTEGER DEFAULT 0").run();
}
if (!colNames.includes('last_daily')) {
    db.prepare("ALTER TABLE kullanicilar ADD COLUMN last_daily TEXT DEFAULT '0'").run();
}
if (!colNames.includes('last_work')) {
    db.prepare("ALTER TABLE kullanicilar ADD COLUMN last_work TEXT DEFAULT '0'").run();
}

// Yardımcı fonksiyonlar
function getUser(userId, guildId) {
    return db.prepare('SELECT * FROM kullanicilar WHERE user_id = ? AND guild_id = ?')
        .get(userId, guildId);
}

function createUser(userId, guildId) {
    db.prepare('INSERT OR IGNORE INTO kullanicilar (user_id, guild_id, xp, level, balance, last_daily, last_work) VALUES (?, ?, 0, 1, 0, \'0\', \'0\')')
        .run(userId, guildId);
    return getUser(userId, guildId);
}

function addXP(userId, guildId, xpAmount) {
    return db.prepare(`
        UPDATE kullanicilar 
        SET xp = xp + ? 
        WHERE user_id = ? AND guild_id = ?
    `).run(xpAmount, userId, guildId);
}

function getBalance(userId, guildId) {
    const row = db.prepare('SELECT balance FROM kullanicilar WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
    return row ? row.balance : null;
}

function addBalance(userId, guildId, amount) {
    return db.prepare('UPDATE kullanicilar SET balance = balance + ? WHERE user_id = ? AND guild_id = ?').run(amount, userId, guildId);
}

function setLastDaily(userId, guildId, timestamp) {
    return db.prepare('UPDATE kullanicilar SET last_daily = ? WHERE user_id = ? AND guild_id = ?').run(String(timestamp), userId, guildId);
}

function setLastWork(userId, guildId, timestamp) {
    return db.prepare('UPDATE kullanicilar SET last_work = ? WHERE user_id = ? AND guild_id = ?').run(String(timestamp), userId, guildId);
}

function transferBalance(fromUserId, toUserId, guildId, amount) {
    const transfer = db.transaction((fromId, toId, gId, amt) => {
        const from = db.prepare('SELECT balance FROM kullanicilar WHERE user_id = ? AND guild_id = ?').get(fromId, gId) || { balance: 0 };
        if (from.balance < amt) throw new Error('Yetersiz bakiye');
        db.prepare('UPDATE kullanicilar SET balance = balance - ? WHERE user_id = ? AND guild_id = ?').run(amt, fromId, gId);
        db.prepare('INSERT OR IGNORE INTO kullanicilar (user_id, guild_id) VALUES (?, ?)').run(toId, gId);
        db.prepare('UPDATE kullanicilar SET balance = balance + ? WHERE user_id = ? AND guild_id = ?').run(amt, toId, gId);
    });

    return transfer(fromUserId, toUserId, guildId, amount);
}

function getRichList(guildId, limit = 10) {
    return db.prepare('SELECT user_id, balance FROM kullanicilar WHERE guild_id = ? ORDER BY balance DESC LIMIT ?').all(guildId, limit);
}

function setLevel(userId, guildId, level) {
    return db.prepare(`
        UPDATE kullanicilar 
        SET level = ? 
        WHERE user_id = ? AND guild_id = ?
    `).run(level, userId, guildId);
}

function getLeaderboard(guildId, limit = 10) {
    return db.prepare(`
        SELECT * FROM kullanicilar 
        WHERE guild_id = ? 
        ORDER BY xp DESC 
        LIMIT ?
    `).all(guildId, limit);
}

// Seviye için gerekli XP'yi hesapla
function calculateRequiredXP(level) {
    return 5 * (Math.pow(level, 2)) + 50 * level + 100;
}

// Verilen XP miktarı için seviye kontrolü yap
function checkLevelUp(currentXP, currentLevel) {
    const requiredXP = calculateRequiredXP(currentLevel);
    return currentXP >= requiredXP;
}

// Tepki Rolleri fonksiyonları
function addReactionRole(messageId, emoji, roleId) {
    return db.prepare('INSERT OR REPLACE INTO tepki_rolleri (message_id, emoji, role_id) VALUES (?, ?, ?)').run(messageId, emoji, roleId);
}

function getReactionRole(messageId, emoji) {
    return db.prepare('SELECT * FROM tepki_rolleri WHERE message_id = ? AND emoji = ?').get(messageId, emoji);
}

function removeReactionRole(messageId, emoji) {
    return db.prepare('DELETE FROM tepki_rolleri WHERE message_id = ? AND emoji = ?').run(messageId, emoji);
}

// Market fonksiyonları
function addMarketItem(guildId, roleId, price) {
    return db.prepare('INSERT OR REPLACE INTO market_items (guild_id, role_id, price) VALUES (?, ?, ?)').run(guildId, roleId, price);
}

function removeMarketItem(roleId) {
    return db.prepare('DELETE FROM market_items WHERE role_id = ?').run(roleId);
}

function getMarketItems(guildId) {
    return db.prepare('SELECT * FROM market_items WHERE guild_id = ?').all(guildId);
}

function getMarketItem(roleId) {
    return db.prepare('SELECT * FROM market_items WHERE role_id = ?').get(roleId);
}

function purchaseItem(userId, guildId, price) {
    return db.prepare('UPDATE kullanicilar SET balance = balance - ? WHERE user_id = ? AND guild_id = ? AND balance >= ?').run(price, userId, guildId, price);
}

// Çekiliş fonksiyonları
function createGiveaway(messageId, guildId, channelId, endTime, winnerCount, prize) {
    return db.prepare(`
        INSERT INTO giveaways (message_id, guild_id, channel_id, end_time, winner_count, prize, is_ended)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(messageId, guildId, channelId, endTime, winnerCount, prize);
}

function getActiveGiveaways() {
    return db.prepare('SELECT * FROM giveaways WHERE is_ended = 0 AND end_time <= ?').all(new Date().toISOString());
}

function endGiveaway(messageId) {
    return db.prepare('UPDATE giveaways SET is_ended = 1 WHERE message_id = ?').run(messageId);
}

function getGiveaway(messageId) {
    return db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
}

module.exports = {
    getUser,
    createUser,
    addXP,
    setLevel,
    getLeaderboard,
    calculateRequiredXP,
    checkLevelUp,
    // Economy exports
    getBalance,
    addBalance,
    setLastDaily,
    setLastWork,
    transferBalance,
    getRichList,
    // Reaction Roles exports
    addReactionRole,
    getReactionRole,
    removeReactionRole,
    // Market exports
    addMarketItem,
    removeMarketItem,
    getMarketItems,
    getMarketItem,
    purchaseItem,
    // Giveaway exports
    createGiveaway,
    getActiveGiveaways,
    endGiveaway,
    getGiveaway
};

// Sağlık kontrolü için basit bir ping fonksiyonu
function ping() {
    try {
        const row = db.prepare('SELECT 1 as ok').get();
        return row && row.ok === 1;
    } catch (err) {
        throw err;
    }
}

module.exports.ping = ping;