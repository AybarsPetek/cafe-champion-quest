import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowLeft,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ExternalLink
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useContactSettings } from "@/hooks/useContactSettings";

const Contact = () => {
  const { data: contactSettings, isLoading } = useContactSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/tanitim" className="flex items-center gap-3">
              <img src={logo} alt="Coffee Academy" className="h-10" />
              <span className="font-bold text-lg hidden sm:inline">Coffee Academy</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/tanitim" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Geri Dön
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">İletişim</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sorularınız için bize ulaşın, size yardımcı olmaktan mutluluk duyarız
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {contactSettings ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Company Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <img src={logo} alt="Logo" className="h-8" />
                    {contactSettings.company_name || "Coffee Academy"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactSettings.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Adres</p>
                        <p className="text-muted-foreground whitespace-pre-line">{contactSettings.address}</p>
                        {contactSettings.google_maps_url && (
                          <a 
                            href={contactSettings.google_maps_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm inline-flex items-center gap-1 mt-1"
                          >
                            Haritada Görüntüle <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {contactSettings.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Telefon</p>
                        <a 
                          href={`tel:${contactSettings.phone}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {contactSettings.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactSettings.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">E-posta</p>
                        <a 
                          href={`mailto:${contactSettings.email}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {contactSettings.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactSettings.working_hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Çalışma Saatleri</p>
                        <p className="text-muted-foreground whitespace-pre-line">{contactSettings.working_hours}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social & Additional Info */}
              <div className="space-y-6">
                {/* Social Media */}
                {(contactSettings.facebook_url || contactSettings.instagram_url || contactSettings.twitter_url || contactSettings.linkedin_url) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sosyal Medya</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {contactSettings.facebook_url && (
                          <Button variant="outline" size="lg" asChild>
                            <a href={contactSettings.facebook_url} target="_blank" rel="noopener noreferrer">
                              <Facebook className="h-5 w-5 mr-2" />
                              Facebook
                            </a>
                          </Button>
                        )}
                        {contactSettings.instagram_url && (
                          <Button variant="outline" size="lg" asChild>
                            <a href={contactSettings.instagram_url} target="_blank" rel="noopener noreferrer">
                              <Instagram className="h-5 w-5 mr-2" />
                              Instagram
                            </a>
                          </Button>
                        )}
                        {contactSettings.twitter_url && (
                          <Button variant="outline" size="lg" asChild>
                            <a href={contactSettings.twitter_url} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-5 w-5 mr-2" />
                              Twitter
                            </a>
                          </Button>
                        )}
                        {contactSettings.linkedin_url && (
                          <Button variant="outline" size="lg" asChild>
                            <a href={contactSettings.linkedin_url} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-5 w-5 mr-2" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Info */}
                {contactSettings.additional_info && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ek Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {contactSettings.additional_info}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      Hemen Başlayın
                    </h3>
                    <p className="mb-4 text-primary-foreground/90">
                      Platformumuzu keşfedin ve ekibinizi eğitin
                    </p>
                    <Button variant="secondary" asChild>
                      <Link to="/">Demo'yu İncele</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                İletişim bilgileri henüz eklenmemiş.
              </p>
              <Button asChild>
                <Link to="/tanitim">Ana Sayfaya Dön</Link>
              </Button>
            </div>
          )}
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
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
