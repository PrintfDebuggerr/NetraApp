# NETRA APP - EKSİKLİKLER VE YAPILACAKLAR LİSTESİ

## 🔴 KRİTİK ÖNCELİKLER (Hemen Yapılmalı)

### Güvenlik Açıkları
- [x] **API Key'leri Gizle** - Firebase ve Resend API key'lerini `.env` dosyasına taşı, kaynak koddan kaldır
- [x] **Firestore Security Rules** - `emailVerifications` koleksiyonuna write yetkisini kısıtla (abuse riski var)
- [x] **Şifre Güvenliği** - Email doğrulama sırasında şifreleri düz metin olarak Firestore'da saklama, sadece Firebase Auth'a gönder
- [x] **Environment Variables Kurulumu** - `.env.example` dosyası oluştur, gerçek `.env`'yi `.gitignore`'a ekle

### Hardcoded Veriler (Acil Düzeltme)
- [x] **Stats Ekranı** - `currentStreak: 58` gibi sabit değerleri gerçek Firestore verisiyle değiştir
- [x] **Profil Verileri** - XP ve `daysToSober` değerlerini kullanıcının gerçek verisinden çek
- [x] **Post Streak Bilgisi** - Gönderi oluştururken kullanıcının gerçek `streakDays` verisini gönder
- [x] **Post Tipi** - Her zaman `'Tips'` yerine kullanıcının seçtiği kategoriyi kaydet

---

## 🟠 YÜKSEK ÖNCELİK (Bu Sprint'te Tamamlanmalı)

### Backend Eksikleri
- [ ] **Like/Upvote Sistemi** - UI'dan gelen beğenileri Firestore'a yazdır
  - `posts/{postId}/likes/{userId}` koleksiyonu oluştur
  - Optimistic UI update ekle
  - Like count'u real-time güncelle
- [ ] **Post Detail Backend** - Gönderi detay sayfası için veri akışını kur
  - Yorum listesini çek
  - Beğeni durumunu kontrol et
  - Real-time listeners ekle

### Oturum ve Auth
- [ ] **Oturum Kalıcılığı** - Firebase Auth `setPersistence` ayarını yapılandır
- [ ] **Şifre Sıfırlama** - "Şifremi Unuttum" ekranı ve Firebase `sendPasswordResetEmail()` entegrasyonu
- [ ] **Email Verification Flow** - Doğrulanmamış kullanıcılar için uyarı göster

---

## 🟡 ORTA ÖNCELİK (2-3 Hafta İçinde)

### UI/UX Tamamlanacaklar
- [ ] **Yorum Sistemi UI** - Post detay sayfasına yorum yazma/görüntüleme ekranı
- [ ] **Ayarlar Ekranı** - Navigation'a bağla, temel ayarlar ekle
  - Profil düzenleme
  - Bildirim tercihleri
  - Tema değiştirme (light/dark)
  - Hesap silme
- [ ] **Bildirimler** - `expo-notifications` ile push notification kurulumu
  - Streak hatırlatıcıları
  - Yeni yorumlar/beğeniler
  - Rozet kazanımları

### Veri Yönetimi
- [ ] **Streak Düzenleme** - Kullanıcının streak'ini manuel düzeltebilmesi (hata durumunda)
- [ ] **Real-time Updates** - Tüm sayaçları (upvote, yorum) canlı güncelle
- [ ] **Pledge Sistemi** - "Söz ver" butonu için handler yaz, Firestore'a kaydet

---

## 🟢 DÜŞÜK ÖNCELİK (İleriki Sürümler)

### Google OAuth
- [ ] Firebase Console'dan client ID al
- [ ] `app.json` içindeki `googleServicesFile` konfigürasyonunu tamamla
- [ ] iOS için `GoogleService-Info.plist` ekle
- [ ] Android için `google-services.json` ekle

### Leaderboard
- [ ] Backend sorgusu yaz (en uzun streak'e göre sıralama)
- [ ] UI ekranı tasarla
- [ ] Günlük/haftalık/aylık filtreleme ekle

### İçerik Özellikleri
- [ ] **AI Terapist** - ChatGPT/Claude API entegrasyonu
- [ ] **Meditasyon** - Ses dosyaları ve rehberli meditasyon ekranı
- [ ] **Nefes Egzersizi** - Animasyonlu nefes alma rehberi (4-7-8 tekniği vb.)
- [ ] **Ambient Sesler** - Yağmur, ateş, doğa sesleri arka plan müziği

---

## 📋 TEKNİK BORÇ

### Kod Kalitesi
- [ ] Hardcoded değerleri `constants.js` dosyasına taşı
- [ ] API çağrıları için merkezi bir `api.js` servisi oluştur
- [ ] Error handling ve kullanıcı geri bildirimi iyileştir
- [ ] Loading state'leri ekle (spinner/skeleton screens)

### Test ve Dökümantasyon
- [ ] Firebase Security Rules'u test et
- [ ] API endpoint'lerini dokümante et
- [ ] README.md güncelle (kurulum adımları)
- [x] `.env.example` dosyası için şablon hazırla

---

## 🎯 MİLESTONE ÖNERİSİ

### Sprint 1 (1-2 Hafta) - "Güvenlik ve Stabilite"
- Tüm API key'leri gizle
- Hardcoded verileri düzelt
- Like/upvote sistemini tamamla
- Oturum kalıcılığını kur

### Sprint 2 (2-3 Hafta) - "Sosyal Özellikler"
- Yorum sistemi UI
- Post detail sayfası
- Bildirimler
- Şifre sıfırlama

### Sprint 3 (3-4 Hafta) - "İçerik ve Growth"
- Leaderboard
- Google OAuth
- Meditasyon/nefes egzersizi
- AI Terapist MVP

---

## 🔧 HIZLI FİKSLER (1-2 Saat)

- [x] `emailVerifications` koleksiyonuna security rule ekle
- [x] Stats ekranındaki `currentStreak: 58`'i sil
- [x] Post oluştururken streak verisini düzelt
- [ ] Ayarlar butonunu navigation'a bağla
- [x] `.gitignore` dosyasını güncelle (`.env`, API keys)

---

## 📊 MEVCUT DURUM ÖZETI

### ✅ Çalışan Özellikler
- Email/şifre ile kayıt & giriş
- 6 haneli email doğrulama kodu
- Google OAuth altyapısı (client ID eksik)
- Streak sayacı (gün/saat/dakika/saniye)
- En uzun streak, nüks sayısı
- Haftalık takvim görünümü
- Rozet/achievement sistemi (8 aktif, 3 kilitli)
- Topluluk feed'i (gönderi oluşturma)
- İstatistik ekranı (kısmen)

### ❌ Broken/Eksik Özellikler
- Like/Upvote sistemi (UI var, backend yok)
- Yorum sistemi (Firestore rules var, UI yok)
- Post detail ekranı (şablon var, içerik yok)
- Leaderboard (buton var, backend yok)
- Real-time updates (upvote/yorum sayıları)
- AI Terapist (sadece buton)
- Meditasyon (sadece buton)
- Nefes egzersizi (sadece buton)
- Ses dosyaları (bağlı değil)
- Pledge sistemi (handler yok)
- Streak düzenleme (UI yok)
- Bildirimler (ikon var, implementasyon yok)
- Ayarlar ekranı (navigation bağlı değil)

---

## 🚨 GÜVENLİK UYARILARI

### KRITIK AÇIKLAR
1. ~~**Firebase API Key** - Kaynak kodda açıkta~~ ✅ Düzeltildi
2. ~~**Resend API Key** - Kaynak kodda açıkta (`re_du9hpDNn_...`)~~ ✅ Düzeltildi
3. ~~**Email Verification** - Koleksiyon herkese açık write iznine sahip~~ ✅ Düzeltildi
4. ~~**Şifre Saklama** - Geçici olarak Firestore'da düz metin şifre saklanıyor~~ ✅ Düzeltildi

### ÖNERİLEN HEMEN ALINMASI GEREKEN ÖNLEMLER
1. Tüm API key'leri environment variable'a taşı
2. Firebase Security Rules'u güncelle
3. Şifreleri asla Firestore'da saklama
4. `.env` dosyasını `.gitignore`'a ekle
5. GitHub'da commit history'den eski key'leri temizle
6. Açığa çıkan API key'leri yeniden oluştur

---

## 💡 GELIŞTIRME ÖNERİLERİ

### Performans
- [ ] Firebase query'lerinde pagination ekle
- [ ] Image lazy loading ekle
- [ ] React Native Performance Monitor kullan
- [ ] Bundle size'ı optimize et

### Kullanıcı Deneyimi
- [ ] Onboarding ekranları ekle
- [ ] Empty state'ler için güzel tasarımlar
- [ ] Hata mesajlarını daha açıklayıcı yap
- [ ] Başarı animasyonları ekle (rozet kazanımı vb.)

### Analytics
- [ ] Firebase Analytics entegre et
- [ ] Kullanıcı davranışlarını takip et
- [ ] Crash reporting ekle (Sentry/Firebase Crashlytics)
- [ ] A/B testing altyapısı kur

---

**Not:** Bu liste öncelik sırasına göre düzenlenmiştir. Önce kırmızı kategorideki kritik güvenlik açıklarını kapatmanı, ardından turuncu kategoriye geçmeni öneririm. Yeşil kategoridekiler uygulamanın temel işlevselliği için şart değil, ama kullanıcı deneyimini artıracak özellikler.

---

## 📝 NOTLAR

- Checkbox'ları (`- [ ]`) işaretleyerek ilerlemeyi takip edebilirsin
- Her özellik tamamlandığında `- [x]` şeklinde işaretle
- Bu dokümanı düzenli olarak güncelle
- Yeni eksiklikler keşfettiğinde listeye ekle

**Son Güncelleme:** 1 Mart 2026 (Sprint 1 tamamlandı)
**Versiyon:** 1.1
**Hazırlayan:** Claude AI
