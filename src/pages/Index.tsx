import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, BookOpen, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-barista.jpg";

const Index = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Profesyonel Eğitimler",
      description: "Uzman baristalardan video eğitimleri ile kahve sanatını öğrenin"
    },
    {
      icon: Award,
      title: "Puan Sistemi",
      description: "Tamamladığınız her eğitimle puan kazanın ve rozetler toplayın"
    },
    {
      icon: TrendingUp,
      title: "İlerleme Takibi",
      description: "Gelişiminizi izleyin ve yeni seviyelere ulaşın"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Barista Academy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/60" />
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Profesyonel Barista Olma Yolculuğunuz Burada Başlıyor
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Uzman eğitmenlerimizden video eğitimleri alın, becerilerinizi geliştirin ve puan kazanarak TheCompany Coffee Academy'de ilerleyin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link to="/courses">
                  Eğitimlere Başla
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">Panelime Git</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Neden TheCompany Coffee Academy?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kahve tutkusunu profesyonel kariyere dönüştürmek için ihtiyacınız olan her şey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border bg-card shadow-soft hover:shadow-hover transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Bugün Başlayın
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            TheCompany Coffee Academy'ye katılın ve profesyonel kahve sanatında uzmanlaşın
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/courses">
              Tüm Eğitimleri Keşfet
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
