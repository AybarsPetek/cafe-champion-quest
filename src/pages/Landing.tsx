import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Play, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  BarChart3,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Menu,
  GraduationCap,
  Users,
  Trophy,
  FileText,
  Library,
  ClipboardList,
  Monitor,
  Smartphone,
  HelpCircle,
  FolderOpen
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

const Landing = () => {
  const portalFeatures = [
    {
      icon: BookOpen,
      title: "Video Tabanlı Eğitimler",
      description: "Profesyonel eğitmenlerimiz tarafından hazırlanmış, başlangıçtan uzmanlığa uzanan kapsamlı video eğitim içerikleri. Her kurs sıralı videolardan oluşur ve ilerlemeniz otomatik olarak kaydedilir."
    },
    {
      icon: HelpCircle,
      title: "Quiz & Sınav Sistemi",
      description: "Her eğitimin sonunda bilginizi ölçen quiz ve sınavlar. Geçme notu, süre sınırı ve detaylı sonuç analizi ile öğrenmenizi pekiştirin."
    },
    {
      icon: Award,
      title: "Sertifikasyon Sistemi",
      description: "Eğitimlerinizi ve sınavlarınızı başarıyla tamamladığınızda benzersiz sertifika numarası ile PDF sertifikanızı indirip yazdırabilirsiniz."
    },
    {
      icon: Trophy,
      title: "Puan & Rozet Sistemi",
      description: "Tamamladığınız her eğitim için puan kazanın, özel rozetler toplayın ve liderlik tablosunda yerinizi alın. Seviye sistemi ile ilerlemenizi takip edin."
    },
    {
      icon: MessageCircle,
      title: "Forum & Bilgi Paylaşımı",
      description: "Kategorilere ayrılmış forum alanında sorularınızı sorun, deneyimlerinizi paylaşın ve diğer ekip arkadaşlarınızla etkileşimde bulunun."
    },
    {
      icon: Library,
      title: "E-Kütüphane",
      description: "Eğitim dokümanları, tarifler, standart prosedürler ve referans materyallerine tek bir yerden erişin. PDF, Excel ve diğer formatlardaki dosyaları indirin."
    },
  ];

  const adminFeatures = [
    {
      icon: Users,
      title: "Kullanıcı Yönetimi",
      description: "Şube çalışanlarınızın kayıt ve onay süreçlerini yönetin. Toplu personel içe aktarma ile hızlıca kullanıcı oluşturun."
    },
    {
      icon: ClipboardList,
      title: "Eğitim Takip & Atama",
      description: "Çalışanlarınıza zorunlu eğitimler atayın, son tarih belirleyin ve tamamlama durumlarını detaylı raporlarla takip edin."
    },
    {
      icon: BarChart3,
      title: "Detaylı Raporlama",
      description: "Kurs tamamlama oranları, sınav başarı yüzdeleri, çalışan bazlı ilerleme raporları ve genel performans analizleri."
    },
  ];

  const userFlow = [
    {
      step: "1",
      title: "Portala Giriş",
      description: "Size verilen e-posta ve şifre ile portala giriş yapın. İlk girişte şifrenizi değiştirmeniz istenecektir."
    },
    {
      step: "2",
      title: "Eğitimlere Başlayın",
      description: "Size atanan zorunlu eğitimleri veya tüm eğitim kataloğunu görüntüleyin. Videoları sırayla izleyerek ilerleyin."
    },
    {
      step: "3",
      title: "Sınavları Tamamlayın",
      description: "Her eğitimin sonundaki sınavı geçerek bilginizi kanıtlayın. Başarılı olduğunuzda puan ve rozet kazanın."
    },
    {
      step: "4",
      title: "Sertifikanızı Alın",
      description: "Tüm eğitim ve sınavları tamamladığınızda resmi sertifikanızı PDF olarak indirin."
    },
  ];

  const navLinks = [
    { href: "#ozellikler", label: "Portal Özellikleri" },
    { href: "#nasil-calisir", label: "Nasıl Çalışır" },
    { href: "#yonetim", label: "Yönetim Paneli" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="TheCompany Coffee Academy" className="h-10" />
            </div>
            
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3">
              {navLinks.map(link => (
                <Button key={link.href} variant="ghost" asChild>
                  <a href={link.href}>{link.label}</a>
                </Button>
              ))}
              <Button variant="ghost" asChild>
                <Link to="/iletisim">İletişim</Link>
              </Button>
              <Button asChild>
                <Link to="/" className="gap-2">
                  Portala Git
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile nav */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col gap-2 p-4 pt-12">
                  <SheetClose asChild>
                    <div className="flex flex-col gap-2">
                      {navLinks.map(link => (
                        <Button key={link.href} variant="ghost" asChild className="w-full justify-start">
                          <a href={link.href}>{link.label}</a>
                        </Button>
                      ))}
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link to="/iletisim">İletişim</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/" className="gap-2">
                          Portala Git
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Franchise Eğitim Portalı
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              TheCompany Coffee Academy
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Franchise şubelerimize özel olarak sunulan online eğitim portalına hoş geldiniz.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Bu portal, tüm ekibinizin profesyonel gelişimini desteklemek, eğitim süreçlerini standartlaştırmak 
              ve performansı takip etmek için tasarlanmıştır. Aşağıda portalın sunduğu tüm hizmetleri detaylı olarak inceleyebilirsiniz.
            </p>
            <Button size="lg" asChild className="gap-2 text-base md:text-lg px-6 md:px-8">
              <Link to="/">
                Portala Giriş Yap
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portal Özellikleri */}
      <section id="ozellikler" className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Portal Özellikleri
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Portalımız ile ekibinizin eğitim sürecini uçtan uca yönetin
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {portalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5 md:p-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section id="nasil-calisir" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Portaldaki eğitim süreciniz 4 basit adımdan oluşur
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {userFlow.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                {index < userFlow.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground/40 mx-auto mt-4 hidden lg:block rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kullanıcı Paneli */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-6">
                Kişisel Paneliniz
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8">
                Portala giriş yaptığınızda kişisel panelinizde tüm eğitim sürecinizi tek bir bakışta görebilirsiniz.
              </p>
              <div className="space-y-4">
                {[
                  "Devam eden ve tamamlanan eğitimleriniz",
                  "Toplam puanınız ve mevcut seviyeniz",
                  "Kazandığınız rozetler ve sertifikalar",
                  "Size atanan zorunlu eğitimler ve son tarihler",
                  "Liderlik tablosundaki sıralamanız",
                  "Kurs değerlendirme ve yorum yapma",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <Monitor className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Masaüstü Uyumlu</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <Smartphone className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Mobil Uyumlu</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Liderlik Tablosu</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">PDF Sertifika</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Yönetim Paneli */}
      <section id="yonetim" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Şube Yönetim Paneli
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Şube yöneticileri, admin paneli üzerinden tüm eğitim süreçlerini yönetebilir ve raporlayabilir
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {adminFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-5 md:p-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seviye Sistemi Detayı */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Seviye & Puan Sistemi
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Eğitimlerinizi tamamladıkça puan kazanır ve seviye atlarsınız
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { level: "Başlangıç", range: "0 - 199 puan", color: "bg-muted" },
              { level: "Orta", range: "200 - 499 puan", color: "bg-primary/20" },
              { level: "İleri", range: "500 - 999 puan", color: "bg-primary/40" },
              { level: "Uzman", range: "1000+ puan", color: "bg-primary" },
            ].map((item, index) => (
              <Card key={index} className="border-border/50 text-center">
                <CardContent className="p-4 md:p-6">
                  <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mx-auto mb-3 ${index === 3 ? 'text-primary-foreground' : ''}`}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.level}</h3>
                  <p className="text-xs text-muted-foreground">{item.range}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Portala Hemen Erişin
          </h2>
          <p className="text-base md:text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Franchise şubeniz için sağlanan giriş bilgileriniz ile portala giriş yaparak eğitimlere hemen başlayabilirsiniz. 
            Herhangi bir sorunuz olduğunda iletişim sayfamızdan bize ulaşabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="gap-2 text-base md:text-lg px-6 md:px-8">
              <Link to="/">
                Portala Giriş Yap
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2 text-base md:text-lg px-6 md:px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/iletisim">
                Bize Ulaşın
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="TheCompany Coffee Academy" className="h-8" />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TheCompany Coffee Academy. Tüm hakları saklıdır.
            </p>
            <Link to="/iletisim" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              İletişim
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
