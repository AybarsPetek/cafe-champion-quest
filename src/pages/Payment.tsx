import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BankTransferInfo from "@/components/BankTransferInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, Shield, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useActivePricingPlans } from "@/hooks/usePaymentSettings";

const Payment = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const { data: pricingPlans, isLoading } = useActivePricingPlans();

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

  // Find selected plan or use the first one
  const selectedPlan = pricingPlans?.find((p: any) => p.id === planId) || pricingPlans?.[0];

  // Fallback plans if database is empty
  const fallbackPlans = [
    {
      id: "standard",
      name: "Standart Üyelik",
      price: 299,
      duration_months: 1,
      features: [
        "Tüm eğitimlere erişim",
        "Sertifika programları",
        "Forum erişimi",
        "Aylık canlı yayınlar",
      ],
      is_popular: false,
    },
    {
      id: "premium",
      name: "Premium Üyelik",
      price: 599,
      duration_months: 1,
      features: [
        "Tüm Standart özellikler",
        "1-1 mentorluk seansları",
        "Özel Discord kanalı",
        "Erken erişim içerikleri",
        "Sınırsız sertifika",
      ],
      is_popular: true,
    },
  ];

  const displayPlans = pricingPlans && pricingPlans.length > 0 ? pricingPlans : fallbackPlans;
  const currentPlan = selectedPlan || displayPlans[0];
  const features = Array.isArray(currentPlan?.features) ? currentPlan.features : [];

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

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Ödeme</h1>
            <p className="text-lg text-muted-foreground">
              Havale/EFT ile güvenli ödeme yapın
            </p>
          </div>

          {/* Plan Selection */}
          {displayPlans.length > 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-center">Plan Seçin</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </>
                ) : (
                  displayPlans.map((plan: any) => (
                    <Link
                      key={plan.id}
                      to={`/payment?plan=${plan.id}`}
                      className={`block p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        currentPlan?.id === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {plan.is_popular && (
                          <span className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3" />
                            Popüler
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        ₺{Number(plan.price).toLocaleString("tr-TR")}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.duration_months} ay
                        </span>
                      </p>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Details */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentPlan?.name}
                  {currentPlan?.is_popular && (
                    <Star className="w-5 h-5 text-primary fill-primary" />
                  )}
                </CardTitle>
                <CardDescription>Seçilen üyelik planı</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <span className="text-4xl font-bold text-primary">
                        {Number(currentPlan?.price || 0).toLocaleString("tr-TR")} ₺
                      </span>
                      <span className="text-muted-foreground">/{currentPlan?.duration_months || 1} ay</span>
                    </div>

                    {features.length > 0 && (
                      <div className="space-y-3">
                        {features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

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
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bank Transfer Info */}
            <BankTransferInfo
              amount={Number(currentPlan?.price || 0)}
              description={`${currentPlan?.name || "Üyelik"} - ${user?.email || "Kullanıcı"}`}
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
