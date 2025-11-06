# Discord.js v14 Gelişmiş Bot

Bu bot, Discord.js v14 kullanılarak geliştirilmiş, çoklu modül ve özellik içeren kapsamlı bir Discord botudur.

## 🌟 Özellikler

### 🎫 Ticket Sistemi
- `/ticket-kurulum` komutu ile kolay kurulum
- Özelleştirilebilir destek rolü
- Otomatik transcript oluşturma
- Kapsamlı log sistemi

### ⭐ Seviye Sistemi
- Otomatik XP kazanma sistemi
- `/rank` ile seviye görüntüleme
- `/leaderboard` ile en yüksek seviyeli üyeler
- Özelleştirilebilir XP oranları

### 💰 Ekonomi Sistemi
- `/balance` ile bakiye görüntüleme
- `/daily` günlük ödül sistemi
- `/work` çalışma sistemi
- `/transfer` para transfer sistemi
- `/richlist` zenginler listesi

### 🛍️ Market Sistemi
- Rol satın alma sistemi
- `/market` ile ürünleri listeleme
- `/market-ekle` ve `/market-kaldir` yönetim komutları
- Bakiye-bazlı alışveriş

### 🎉 Çekiliş Sistemi
- `/cekilis-baslat` ile kolay çekiliş
- Otomatik kazanan seçimi
- Veritabanı destekli kalıcı çekilişler
- Özelleştirilebilir kazanan sayısı

### ✅ Doğrulama Sistemi
- Buton-bazlı kolay doğrulama
- `/dogrulama-kurulum` ile hızlı kurulum
- Özelleştirilebilir doğrulanmış üye rolü
- Log sistemi entegrasyonu

### 📊 Sunucu İstatistikleri
- Otomatik güncellenen ses kanalları
- Toplam üye sayacı
- Çevrimiçi üye sayacı
- Bot sayacı

### 🎭 Tepki Rolleri
- `/tepki-rol-ekle` ile kolay kurulum
- Emoji ile rol verme/alma
- Özel emoji desteği
- Veritabanı entegrasyonu

### 👮 Moderasyon Komutları
- Ban, Kick, Mute sistemleri
- Toplu mesaj silme
- Yasaklı kelime filtresi
- Detaylı log sistemi

### 🎮 Eğlence Komutları
- `/tas-kagit-makas`: Klasik oyun
- `/yazi-tura`: Yazı tura atma
- `/zar-at`: Zar atma
- `/soyle`: Bot tekrarlama

## 📋 Gereksinimler

- Node.js v16.9.0 veya üstü
- Discord.js v14
- SQLite veritabanı
- better-sqlite3 paketi

## ⚙️ Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/ALADAG-Seyit-Mehmet/dc-bot-newversion.git
cd dc-bot-newversion
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```env
TOKEN=your_bot_token_here
```

4. `config.json` dosyasını düzenleyin:
```json
{
  "LOG_KANALI_ID": "log_kanal_id",
  "TICKET_DESTEK_ROLU_ID": "destek_rol_id",
  "DOGRULANMIS_UYE_ROLU_ID": "dogrulanmis_rol_id",
  "HOSGELDIN_KANALI_ID": "hosgeldin_kanal_id",
  "AYRILMA_KANALI_ID": "ayrilma_kanal_id"
}
```

5. Slash komutlarını yükleyin:
```bash
node src/deploy-commands.js
```

6. Botu başlatın:
```bash
node src/index.js
```

## 🔧 Bot İzinleri

Bot'un ihtiyaç duyduğu izinler:
- Mesajları Yönet
- Kanalları Yönet
- Rolleri Yönet
- Üyeleri At
- Üyeleri Yasakla
- Üyeleri Sustur
- Mesaj Geçmişini Gör

## 🎯 Gerekli Intents

- GUILDS
- GUILD_MEMBERS
- GUILD_MESSAGES
- GUILD_MESSAGE_REACTIONS
- MESSAGE_CONTENT

## 📚 Veritabanı Yapısı

### kullanicilar tablosu
- user_id (TEXT)
- guild_id (TEXT)
- xp (INTEGER)
- level (INTEGER)
- balance (INTEGER)
- last_daily (TEXT)
- last_work (TEXT)

### tepki_rolleri tablosu
- message_id (TEXT)
- emoji (TEXT)
- role_id (TEXT)

### market_items tablosu
- guild_id (TEXT)
- role_id (TEXT)
- price (INTEGER)

### giveaways tablosu
- message_id (TEXT)
- guild_id (TEXT)
- end_time (TEXT)
- winner_count (INTEGER)
- prize (TEXT)
- is_ended (BOOLEAN)

## 🤝 Katkıda Bulunma

1. Projeyi forklayın
2. Feature branch oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/YeniOzellik`)
5. Pull Request açın

## 📜 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır.

## 💬 Destek

Sorularınız için Issues bölümünü kullanabilir veya GitHub üzerinden iletişime geçebilirsiniz.