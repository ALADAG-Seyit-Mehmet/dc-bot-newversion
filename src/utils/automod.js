const { PermissionsBitField } = require('discord.js');
const { yasakliKelimeler, yasakliLinkler, guvenliDomainler } = require('../data/yasakliKelimeler.json');

// Kullanıcı ihlallerini tutmak için Map
const userViolations = new Map();
// Spam kontrolü için son mesajları tutmak için Map
const userMessages = new Map();

// Kullanıcının son mesajlarını kontrol et
function checkSpam(userId, content, timestamp) {
    if (!userMessages.has(userId)) {
        userMessages.set(userId, []);
    }

    const userMsgs = userMessages.get(userId);
    // 5 saniyeden eski mesajları temizle
    const now = Date.now();
    while (userMsgs.length > 0 && now - userMsgs[0].timestamp > 5000) {
        userMsgs.shift();
    }

    // Son mesajları kontrol et
    const similarMessages = userMsgs.filter(msg => msg.content === content).length;
    const messageCount = userMsgs.length;

    // Yeni mesajı ekle
    userMsgs.push({ content, timestamp });
    userMessages.set(userId, userMsgs);

    // Spam kontrolü (3 saniyede 4'ten fazla mesaj veya aynı mesajdan 3 tane)
    return messageCount >= 4 || similarMessages >= 2;
}

// Yasaklı kelime kontrolü
function containsBadWords(content) {
    const lowercaseContent = content.toLowerCase();
    return yasakliKelimeler.some(word => lowercaseContent.includes(word.toLowerCase()));
}

// Link kontrolü
function containsUnsafeLinks(content) {
    const urlRegex = /(https?:\/\/[^\s]+|discord\.gg\/[^\s]+)/gi;
    const matches = content.match(urlRegex);
    
    if (!matches) return false;

    return matches.some(url => {
        const lowercaseUrl = url.toLowerCase();
        // Güvenli domainleri kontrol et
        if (guvenliDomainler.some(domain => lowercaseUrl.includes(domain))) {
            return false;
        }
        // Yasaklı kelimeleri içeren linkleri kontrol et
        return yasakliLinkler.some(keyword => lowercaseUrl.includes(keyword));
    });
}

// İhlal sayısını artır ve kontrol et
function checkAndIncrementViolations(userId) {
    if (!userViolations.has(userId)) {
        userViolations.set(userId, {
            count: 0,
            lastViolation: Date.now()
        });
    }

    const violation = userViolations.get(userId);
    const now = Date.now();

    // Son ihlalden 10 dakika geçtiyse sayacı sıfırla
    if (now - violation.lastViolation > 600000) {
        violation.count = 0;
    }

    violation.count++;
    violation.lastViolation = now;
    userViolations.set(userId, violation);

    return violation.count;
}

// Otomatik moderasyon sebeplerini belirle
function determineModReason(content) {
    if (containsBadWords(content)) return 'küfür/hakaret';
    if (containsUnsafeLinks(content)) return 'güvensiz link';
    return 'spam/flood';
}

module.exports = {
    checkSpam,
    containsBadWords,
    containsUnsafeLinks,
    checkAndIncrementViolations,
    determineModReason
};