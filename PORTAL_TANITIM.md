# TheCompany Coffee Academy - Portal Tanıtımı

## 🎯 Genel Bakış

**TheCompany Coffee Academy**, profesyonel barista yetiştirmek ve kahve kültürünü yaygınlaştırmak amacıyla tasarlanmış kapsamlı bir online eğitim platformudur. Modern web teknolojileri kullanılarak geliştirilen bu platform, interaktif video eğitimleri, oyunlaştırılmış öğrenme deneyimi ve profesyonel sertifikasyon sistemi sunmaktadır.

---

## 📚 Platform Özellikleri

### 1. Eğitim Sistemi
- **Video Tabanlı Eğitimler**: Her kurs, profesyonel eğitmenler tarafından hazırlanmış yüksek kaliteli video içeriklerden oluşur
- **Seviye Bazlı Kurslar**: Başlangıç, Orta, İleri ve Uzman seviyelerinde kurslar
- **İlerleme Takibi**: Her video ve kurs için detaylı ilerleme takibi
- **Kurs Değerlendirmeleri**: Kullanıcılar kursları 1-5 yıldız ile puanlayabilir ve yorum yapabilir

### 2. Oyunlaştırma ve Motivasyon
- **Puan Sistemi**: Tamamlanan her eğitim için puan kazanımı
- **Rozet Koleksiyonu**: Belirli başarılar için özel rozetler
  - Kurs tamamlama rozetleri
  - Puan eşiği rozetleri
  - Özel başarı rozetleri
- **Seviye Sistemi**: Kazanılan puanlara göre kullanıcı seviyeleri
  - Başlangıç (0-199 puan)
  - Orta (200-499 puan)
  - İleri (500-999 puan)
  - Uzman (1000+ puan)
- **Liderlik Tablosu**: Tüm kullanıcıların sıralandığı rekabet tablosu

### 3. Sertifikasyon
- **Resmi Sertifikalar**: Kurs tamamlandığında PDF formatında sertifika
- **Benzersiz Sertifika Numarası**: Her sertifika için takip edilebilir numara
- **Doğrulanabilirlik**: Sertifika numarası ile doğrulama imkanı

### 4. Kullanıcı Paneli (Dashboard)
- **Kişisel İstatistikler**: Tamamlanan kurs sayısı, toplam puan, rozet sayısı
- **Devam Eden Eğitimler**: Yarım kalan kurslar ve ilerleme durumu
- **Rozet Vitrini**: Kazanılan ve kazanılmayı bekleyen rozetler
- **Seviye İlerlemesi**: Bir sonraki seviyeye kalan puan göstergesi

### 5. Yönetim Paneli (Admin)
- **Kullanıcı Onay Sistemi**: Yeni kayıtların manuel onaylanması
- **Kurs Yönetimi**: Kurs ekleme, düzenleme, silme
- **Video Yönetimi**: Video içeriklerin yönetimi
- **Sertifika Yönetimi**: Sertifika verme ve takibi
- **Kullanıcı Rolleri**: Admin ve standart kullanıcı rolleri

---

## 🔐 Güvenlik ve Erişim

### Kimlik Doğrulama
- E-posta ve şifre ile güvenli giriş
- Yeni kullanıcı kayıt sistemi
- Admin onay gerektiren kayıt süreci
- Oturum yönetimi ve otomatik çıkış

### Yetkilendirme
- **Herkese Açık**: Ana sayfa, kurs listesi, liderlik tablosu
- **Üyelere Özel**: Kurs detayları, video izleme, dashboard
- **Sadece Admin**: Yönetim paneli, kullanıcı onayı

---

## 🛠 Teknik Altyapı

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Tip güvenli geliştirme
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Erişilebilir UI bileşenleri
- **React Query** - Server state yönetimi
- **React Router** - Sayfa yönlendirme

### Backend (Lovable Cloud)
- **Veritabanı**: PostgreSQL ile ilişkisel veri yönetimi
- **Kimlik Doğrulama**: Güvenli authentication sistemi
- **Edge Functions**: Sunucusuz backend fonksiyonları
- **Row Level Security**: Veritabanı seviyesinde güvenlik

---

## 📊 Veritabanı Yapısı

| Tablo | Açıklama |
|-------|----------|
| `profiles` | Kullanıcı profilleri ve seviyeleri |
| `courses` | Kurs bilgileri |
| `course_videos` | Kurs videoları |
| `user_course_progress` | Kurs ilerleme kayıtları |
| `user_video_progress` | Video izleme ilerleme kayıtları |
| `badges` | Rozet tanımları |
| `user_badges` | Kazanılan rozetler |
| `certificates` | Verilen sertifikalar |
| `course_reviews` | Kurs yorumları ve puanları |
| `user_roles` | Kullanıcı rolleri (admin/user) |

---

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Primary**: Sıcak kahverengi tonları (HSL: 25° 80% 35%)
- **Accent**: Altın sarısı vurgular (HSL: 35° 85% 55%)
- **Background**: Krem beyazı arka plan
- **Dark Mode**: Koyu kahverengi tema desteği

### Animasyonlar
- Fade-in giriş animasyonları
- Slide-up kart animasyonları
- Hover efektleri ile etkileşim geri bildirimi

---

## 📱 Responsive Tasarım

Platform, tüm cihaz boyutlarında optimum kullanıcı deneyimi sunacak şekilde tasarlanmıştır:
- **Mobil**: Tek sütun düzeni, hamburger menü
- **Tablet**: 2 sütun kurs grid'i
- **Desktop**: 3 sütun kurs grid'i, tam navigasyon

---

## 🚀 Kullanım Senaryoları

### Yeni Kullanıcı Akışı
1. Ana sayfayı ziyaret et
2. "Kayıt Ol" butonuna tıkla
3. Ad, e-posta ve şifre ile kayıt ol
4. Admin onayını bekle
5. Onay sonrası giriş yap ve eğitimlere başla

### Eğitim Tamamlama Akışı
1. Kurs kütüphanesinden kurs seç
2. Videoları sırayla izle
3. Her video tamamlandığında ilerleme kaydedilir
4. Tüm videolar izlendiğinde kurs tamamlanır
5. Puan kazanılır ve rozetler kontrol edilir
6. Sertifika indirilmeye hazır hale gelir

### Admin İş Akışı
1. Yeni kullanıcı kayıtlarını onayla/reddet
2. Yeni kurslar ve videolar ekle
3. Mevcut içerikleri düzenle
4. Sertifika ver ve takip et
5. Kullanıcı rollerini yönet

---

## 📈 Gelecek Geliştirmeler (Öneriler)

- [ ] Quiz/sınav sistemi
- [ ] Sosyal medya paylaşımı
- [ ] Gelişmiş arama ve filtreleme
- [ ] Bildirim sistemi
- [ ] Canlı eğitim (webinar) desteği
- [ ] Mobil uygulama
- [ ] Çoklu dil desteği
- [ ] API entegrasyonları

---

## 📞 İletişim

Bu platform TheCompany Coffee tarafından geliştirilmiştir.

---

*Son güncelleme: Aralık 2025*
