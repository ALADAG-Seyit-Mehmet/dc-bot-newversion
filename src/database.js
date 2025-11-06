const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'levels.db'));

// Tablo oluştur
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
    )
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
    getRichList
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