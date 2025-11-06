# Discord Bot - Yeni Versiyon

Bu proje, Discord.js v14 kullanarak geliştirilmiş modern ve modüler bir Discord botudur. Bot, eğlence, ekonomi, moderasyon, seviye sistemi, ticket sistemi ve yönetim komutları gibi çeşitli özellikler sunmaktadır.

## Özellikler

### Eğlence Komutları
- `ping`: Botun yanıt süresini kontrol eder.
- `soyle`: Botun belirttiğiniz metni söylemesini sağlar.
- `tas-kagit-makas`: Taş-kağıt-makas oyunu oynar.
- `zar-at`: Zar atar.
- `yazi-tura`: Yazı-tura atar.

### Ekonomi Komutları
- `balance`: Kullanıcının bakiyesini gösterir.
- `daily`: Günlük ödül alır.
- `work`: Çalışarak para kazanır.
- `transfer`: Başka bir kullanıcıya para transfer eder.
- `richlist`: En zengin kullanıcıları listeler.

### Moderasyon Komutları
- `ban`: Kullanıcıyı banlar.
- `kick`: Kullanıcıyı sunucudan atar.
- `mute`: Kullanıcıyı susturur.
- `unmute`: Kullanıcının susturmasını kaldırır.
- `clear`: Mesajları temizler.
- `temizle`: Belirli sayıda mesajı siler.

### Seviye Komutları
- `rank`: Kullanıcının seviyesini gösterir.
- `leaderboard`: Seviye lider tablosunu gösterir.

### Ticket Sistemi
- `ticket-kurulum`: Ticket sistemini kurar.

### Yönetim Komutları
- `checkup`: Botun durumunu kontrol eder.

### Diğer Özellikler
- Otomatik moderasyon (yasaklı kelimeler filtresi).
- Kullanıcı giriş/çıkış logları.
- Mesaj güncelleme/silme logları.
- Veritabanı desteği (SQLite).

## Kurulum

1. Bu projeyi klonlayın veya indirin.
2. Gerekli bağımlılıkları yükleyin:
   ```
   npm install
   ```
3. `config.json` dosyasını düzenleyin ve bot tokenınızı ekleyin.
4. `.env` dosyasını oluşturun ve gerekli çevre değişkenlerini ayarlayın (örneğin, veritabanı yolu).

## Yapılandırma

- `config.json`: Botun temel yapılandırmasını içerir (token, prefix, vb.).
- `src/data/yasakliKelimeler.json`: Yasaklı kelimeler listesi.
- Veritabanı: `src/database.js` ile SQLite kullanılır.

## Çalıştırma

Komutları dağıtmak için:
```
npm run deploy
```

Botu başlatmak için:
```
npm start
```

## Katkıda Bulunma

Katkıda bulunmak için lütfen bir pull request oluşturun. Büyük değişiklikler için önce bir issue açın.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Sorularınız için [GitHub Issues](https://github.com/ALADAG-Seyit-Mehmet/dc-bot-newversion/issues) kullanabilirsiniz.
