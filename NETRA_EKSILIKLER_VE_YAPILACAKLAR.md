# NETRA APP - EKSİKLİKLER VE YAPILACAKLAR LİSTESİ

---

## 🗺️ PROJE ÖZETİ (Yeni Hafıza / Hızlı Referans)

### Ne Bu Uygulama?
NoFap benzeri bir mobil uygulama. Kullanıcıların mastürbasyon ve pornodan uzak durma süreçlerini takip etmelerine yardımcı olur. Streak sayacı, topluluk, rozetler içerir.

### Tech Stack
| Katman | Teknoloji |
|--------|-----------|
| Framework | React Native + Expo SDK 54 |
| Navigation | React Navigation (bottom tabs + stack) |
| Backend | Firebase (Auth + Firestore) |
| Email | Resend API (doğrulama kodu) |
| State | React Context API |
| Storage | AsyncStorage (lokal streak cache) |

### Klasör Yapısı
```
netraapp/
├── .env                        ← API key'ler (gitignore'da, lokalde tut)
├── .env.example                ← Boş şablon (GitHub'da)
├── config/
│   └── firebase.js             ← Firebase init, env'den key okur
├── src/
│   ├── screens/                ← 10 ekran
│   │   ├── HomeScreen.js       ← Ana ekran: sayaç, haftalık takvim, panik butonu
│   │   ├── StatsScreen.js      ← Analytics: yüzde halka, hedef tarihi, faydalar
│   │   ├── FeedScreen.js       ← Topluluk feed, post oluşturma (tip seçici var)
│   │   ├── ProfileScreen.js    ← Profil, XP, achievements, logout
│   │   ├── LibraryScreen.js    ← İçerik hub (meditasyon, nefes vb. - stub'lar)
│   │   ├── LoginScreen.js      ← Email + Google OAuth (Google client ID eksik)
│   │   ├── RegisterScreen.js   ← Kayıt formu
│   │   ├── VerificationScreen.js ← 6 haneli kod doğrulama
│   │   ├── PostDetailScreen.js ← Gönderi detay (stub)
│   │   └── AchievementsScreen.js ← Rozet koleksiyonu
│   ├── components/
│   │   ├── CreatePostModal.js  ← Post modal (Victory/Vent/Tips/Relapse tip seçici)
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.js      ← Auth state, register/login/logout fonksiyonları
│   │   └── StreakContext.js     ← Streak state, sayaç, reset
│   ├── navigation/
│   │   ├── MainTabs.js         ← 5 tab: Home|Stats|Library|Feed|Profile
│   │   ├── AuthStack.js        ← Login → Register → Verification
│   │   ├── HomeStack.js        ← Home + alt ekranlar
│   │   └── FeedStack.js        ← Feed + PostDetail + Comments
│   ├── services/
│   │   ├── emailService.js     ← Resend API ile doğrulama emaili gönder
│   │   └── verificationService.js ← Firestore'da kod saklama/doğrulama
│   └── utils/
│       ├── streakManager.js    ← Streak hesaplama, lokal kayıt
│       ├── authHelpers.js      ← Email/şifre validasyon, hata mesajları
│       ├── badgeData.js        ← Rozet tanımları
│       └── googleAuthConfig.js ← Google OAuth config (client ID boş)
├── firestore.rules             ← Güvenlik kuralları
└── NETRA_EKSILIKLER_VE_YAPILACAKLAR.md ← Bu dosya
```

### Firestore Koleksiyonları
| Koleksiyon | Anahtar Alanlar | Not |
|------------|-----------------|-----|
| `users/{userId}` | email, username, emailVerified | Sadece kayıt tamamlanınca oluşur |
| `streaks/{userId}` | currentStreak, longestStreak, startDate, relapses | userId = doc ID |
| `posts/{postId}` | userId, userName, content, type, streakDays, likes, commentCount | type: Victory/Vent/Tips/Relapse |
| `comments/{commentId}` | userId, postId, content | UI yok, schema hazır |
| `emailVerifications/{email}` | userId, username, code, expiresAt, verified, attempts | Şifre YOK (güvenlik) |

### Auth Akışı
```
Kayıt:
  RegisterScreen
    → createUserWithEmailAndPassword (Firebase Auth)
    → saveVerificationCode (Firestore - şifresiz)
    → sendVerificationEmail (Resend)
    → VerificationScreen
    → verifyCode ✓ → completeRegistration (Firestore user+streak oluştur)
    → setUser() → MainTabs

Giriş:
  LoginScreen
    → signInWithEmailAndPassword
    → isEmailVerified kontrolü (Firestore users koleksiyonu)
    → ✓ → MainTabs / ✗ → Verification yönlendir
```

### Renk Paleti
- Primary (ana yeşil): `#0df2a6`
- Arka plan: `#0a0e27` / `#0F172A` / `#162035`
- Hata/vurgu kırmızı: `#e94560`

### Önemli Notlar
- **Google OAuth**: Altyapı hazır ama `app.json`'daki client ID'ler boş → çalışmıyor
- **Like sistemi**: UI var (upvote butonu), Firestore bağlantısı YOK → hardcoded sayı gösteriyor
- **Yorum sistemi**: Firestore rules hazır, UI yok
- **PostDetail/Comments ekranları**: Stub/şablon, içerik yok
- **LibraryScreen içerikleri**: Meditasyon, nefes, AI terapist → sadece buton, implementasyon yok
- **Streak**: AsyncStorage (lokal) + Firestore (bulut) çift katman, her ikisi senkronize
- **XP sistemi**: `currentStreak * 10 + longestStreak * 5` formülü (basit)

---

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
- [x] **Like/Upvote Sistemi** - `likedBy` array + `likes` count ile Firestore'a bağlandı
  - `post.likedBy` array toggle (arrayUnion/arrayRemove + increment)
  - Real-time update onSnapshot ile geliyor
  - FeedScreen + PostDetailScreen her ikisinde çalışıyor
- [x] **Post Detail Backend** - Firestore'dan gerçek veriler bağlandı
  - `comments` koleksiyonundan real-time yorum listesi (postId filtreli)
  - Yorum gönderme Firestore'a kaydediliyor + commentCount artıyor
  - Post like durumu real-time izleniyor

### Oturum ve Auth
- [x] **Oturum Kalıcılığı** - `initializeAuth` + `getReactNativePersistence(AsyncStorage)` ile firebase.js güncellendi
- [x] **Şifre Sıfırlama** - LoginScreen'de inline "Şifremi Unuttum" formu eklendi (`sendPasswordResetEmail`)
- [x] **Email Verification Flow** - `login()` artık `EMAIL_NOT_VERIFIED`'da sign-out yapmıyor; LoginScreen `getVerificationUsername` ile Firestore'dan kullanıcı adını alıp VerificationScreen'e yönlendiriyor

---

## 🟡 ORTA ÖNCELİK (2-3 Hafta İçinde)

### UI/UX Tamamlanacaklar
- [x] **Yorum Sistemi UI** - PostDetailScreen'de Firestore'a bağlı, tam çalışıyor
- [x] **Ayarlar Ekranı** - `SettingsScreen.js` oluşturuldu, `ProfileStack.js` ile navigation'a bağlandı
  - Bildirim toggle (UI hazır, expo-notifications henüz bağlı değil)
  - Dark mode toggle (UI hazır)
  - Şifre sıfırlama (Alert üzerinden)
  - Hesap silme (stub - "not available" uyarısı)
  - Logout (Alert onaylı)
- [x] **Bildirimler** - `expo-notifications` kuruldu ve bağlandı
  - Streak hatırlatıcıları (her gün 20:00, tekrarlayan yerel bildirim)
  - Rozet/milestone bildirimleri (1, 7, 14, 21, 30, 45, 60, 90, 180, 365. günler)
  - SettingsScreen toggle → izin iste + hatırlatıcı planla / iptal et
  - Streak reset → milestone geçmişini sıfırla (tekrar kazanabilsin)

### Veri Yönetimi
- [x] **Streak Düzenleme** - HomeScreen'de "Edit Streak" modal eklendi; gün sayısı girerek düzeltilebiliyor, `StreakContext.editStreak()` ile Firestore+AsyncStorage güncelleniyor
- [x] **Real-time Updates** - FeedScreen `onSnapshot` ile post listesi + like/commentCount canlı; PostDetailScreen ayrıca post + yorumları `onSnapshot` ile dinliyor
- [x] **Pledge Sistemi** - HomeScreen "Pledge" butonu Alert + Firestore `pledges/{userId}` koleksiyonuna kaydediyor

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
- [x] Ayarlar butonunu navigation'a bağla (ProfileStack → SettingsScreen)
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
- Topluluk feed'i (gönderi oluşturma + real-time)
- İstatistik ekranı
- **Like/Upvote sistemi** (Firestore'a bağlı, real-time)
- **Yorum sistemi** (PostDetail'de Firestore real-time)
- **Şifre sıfırlama** (LoginScreen'den email ile)

### ❌ Broken/Eksik Özellikler
- Leaderboard (buton var, backend yok)
- AI Terapist (sadece buton)
- Meditasyon (sadece buton)
- Nefes egzersizi (sadece buton)
- Ses dosyaları (bağlı değil)
- Pledge sistemi (handler yok)
- Streak düzenleme (UI yok)
- Bildirimler (ikon var, implementasyon yok)
- ~~Ayarlar ekranı~~ ✅ Tamamlandı

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

**Son Güncelleme:** 1 Mart 2026 (Sprint 3 - expo-notifications: günlük hatırlatıcı + milestone bildirimleri ✅)
**Versiyon:** 1.5
**Hazırlayan:** Claude AI
