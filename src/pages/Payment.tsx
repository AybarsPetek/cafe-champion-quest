import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BankTransferInfo from "@/components/BankTransferInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Payment = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "standard";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const plans = {
    standard: {
      name: "Standart Üyelik",
      price: 299,
      features: [
        "Tüm eğitimlere erişim",
        "Sertifika programları",
        "Forum erişimi",
        "Aylık canlı yayınlar",
      ],
    },
    premium: {
      name: "Premium Üyelik",
      price: 599,
      features: [
        "Tüm Standart özellikler",
        "1-1 mentorluk seansları",
        "Özel Discord kanalı",
        "Erken erişim içerikleri",
        "Sınırsız sertifika",
      ],
    },
  };

  const selectedPlan = plans[plan as keyof typeof plans] || plans.standard;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Ödeme</h1>
            <p className="text-lg text-muted-foreground">
              Havale/EFT ile güvenli ödeme yapın
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Details */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{selectedPlan.name}</CardTitle>
                <CardDescription>Seçilen üyelik planı</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <span className="text-4xl font-bold text-primary">
                    {selectedPlan.price.toLocaleString("tr-TR")} ₺
                  </span>
                  <span className="text-muted-foreground">/ay</span>
                </div>

                <div className="space-y-3">
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Güvenli ödeme</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>1-2 iş günü içinde aktivasyon</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer Info */}
            <BankTransferInfo
              amount={selectedPlan.price}
              description={`${selectedPlan.name} - ${user?.email || "Kullanıcı"}`}
            />
          </div>

          {/* Additional Info */}
          <Card className="mt-8 shadow-soft">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-4">Sıkça Sorulan Sorular</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Ödeme ne zaman onaylanır?</p>
                  <p className="text-sm text-muted-foreground">
                    Havale/EFT ödemeleri genellikle 1-2 iş günü içinde onaylanır. Dekont paylaşmanız durumunda bu süre kısalabilir.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Üyelik ne zaman başlar?</p>
                  <p className="text-sm text-muted-foreground">
                    Ödemeniz onaylandıktan hemen sonra üyeliğiniz aktif olur ve tüm içeriklere erişebilirsiniz.
                  </p>
                </div>
                <div>
                  <p className="font-medium">İptal ve iade politikası nedir?</p>
                  <p className="text-sm text-muted-foreground">
                    İlk 7 gün içinde memnun kalmazsanız tam iade yapılır. Detaylı bilgi için bizimle iletişime geçebilirsiniz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
