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
  Sparkles
} from "lucide-react";
import logo from "@/assets/logo.png";
import { usePricingPlans } from "@/hooks/usePaymentSettings";

const Landing = () => {
  const { data: pricingPlans, isLoading: isPricingLoading } = usePricingPlans();
  const features = [
    {
      icon: BookOpen,
      title: "Video Tabanlı Eğitimler",
      description: "Profesyonel eğitmenler tarafından hazırlanmış yüksek kaliteli video içerikler"
    },
    {
      icon: Award,
      title: "Sertifikasyon Sistemi",
      description: "Eğitim tamamlandığında resmi PDF sertifikası ve benzersiz sertifika numarası"
    },
    {
      icon: TrendingUp,
      title: "Oyunlaştırılmış Öğrenme",
      description: "Puan sistemi, rozetler ve liderlik tablosu ile motivasyonu artırın"
    },
    {
      icon: Shield,
      title: "Admin Onay Sistemi",
      description: "Yeni kayıtlar için manuel onay süreci ile güvenli kullanıcı yönetimi"
    },
    {
      icon: BarChart3,
      title: "İlerleme Takibi",
      description: "Her çalışanın eğitim ilerlemesini detaylı raporlarla takip edin"
    },
    {
      icon: MessageCircle,
      title: "Forum & Tartışma",
      description: "Çalışanların bilgi paylaşımı yapabileceği entegre forum sistemi"
    }
  ];

  const benefits = [
    "Sınırsız video eğitimi yükleme",
    "Çoklu mağaza/şube desteği",
    "Mobil uyumlu tasarım",
    "Gerçek zamanlı ilerleme takibi",
    "Özelleştirilebilir rozet sistemi",
    "Quiz ve sınav modülü",
    "Detaylı analitik raporlar",
    "7/24 teknik destek"
  ];

  const useCases = [
    {
      title: "Kahve Zincirleri",
      description: "Barista eğitimlerini standartlaştırın ve kaliteyi her şubede aynı tutun"
    },
    {
      title: "Restoranlar",
      description: "Servis standartları, hijyen kuralları ve menü bilgisi eğitimleri"
    },
    {
      title: "Perakende",
      description: "Satış teknikleri, ürün bilgisi ve müşteri hizmetleri eğitimleri"
    },
    {
      title: "Kurumsal",
      description: "Oryantasyon programları, uyum eğitimleri ve sürekli gelişim"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Coffee Academy" className="h-10" />
              <span className="font-bold text-lg hidden sm:inline">Coffee Academy</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <a href="#features">Özellikler</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#pricing">Fiyatlandırma</a>
              </Button>
              <Button asChild>
                <Link to="/" className="gap-2">
                  <Play className="h-4 w-4" />
                  Demoyu İncele
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Çalışan Eğitim Platformu
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Ekibinizi Profesyonelce Eğitin
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Video eğitimleri, sertifikasyon sistemi ve oyunlaştırılmış öğrenme ile çalışanlarınızın gelişimini hızlandırın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 text-lg px-8">
                <Link to="/">
                  <Play className="h-5 w-5" />
                  Canlı Demoyu Görüntüle
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-lg px-8">
                <a href="#pricing">
                  Fiyatları İncele
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Aktif Kullanıcı</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Eğitim Videosu</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">%98</div>
                <div className="text-sm text-muted-foreground">Memnuniyet</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Her Şey Dahil Eğitim Platformu
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Çalışan eğitimi için ihtiyacınız olan tüm araçlar tek bir platformda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Her Sektöre Uygun
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Farklı sektörlerdeki işletmeler için özelleştirilebilir çözümler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="text-center border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Neden Coffee Academy?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Yılların tecrübesi ve müşteri geri bildirimleriyle geliştirilen, 
                kullanımı kolay ve güçlü eğitim platformu.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/">
                    <Play className="h-6 w-6" />
                    Demoyu Başlat
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Şeffaf Fiyatlandırma
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              İşletmenizin büyüklüğüne uygun esnek planlar
            </p>
          </div>

          {isPricingLoading ? (
            <div className="text-center text-muted-foreground">Yükleniyor...</div>
          ) : pricingPlans && pricingPlans.length > 0 ? (
            <div className={`grid gap-8 max-w-5xl mx-auto ${
              pricingPlans.length === 1 ? 'md:grid-cols-1 max-w-md' :
              pricingPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
              'md:grid-cols-3'
            }`}>
              {pricingPlans.map((plan) => {
                const features = Array.isArray(plan.features) 
                  ? plan.features as string[]
                  : [];
                
                return (
                  <Card 
                    key={plan.id} 
                    className={plan.is_popular ? "border-primary relative" : "border-border/50"}
                  >
                    {plan.is_popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Popüler
                      </div>
                    )}
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground mb-4">{plan.description}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">₺{plan.price.toLocaleString('tr-TR')}</span>
                        <span className="text-muted-foreground">
                          /{plan.duration_months === 1 ? 'ay' : `${plan.duration_months} ay`}
                        </span>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        variant={plan.is_popular ? "default" : "outline"} 
                        className="w-full" 
                        asChild
                      >
                        <Link to={`/payment?plan=${plan.id}`}>Demoyu İncele</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Henüz fiyatlandırma planı eklenmemiş.
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Ekibinizi Bugün Güçlendirin
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Hemen demo hesabı ile platformu keşfedin ve işletmeniz için nasıl fark yaratabileceğini görün
          </p>
          <Button size="lg" variant="secondary" asChild className="gap-2 text-lg px-8">
            <Link to="/">
              <Play className="h-5 w-5" />
              Ücretsiz Demo Başlat
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Coffee Academy" className="h-8" />
              <span className="font-semibold">Coffee Academy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Coffee Academy. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Gizlilik Politikası
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kullanım Koşulları
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
