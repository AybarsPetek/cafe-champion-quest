import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Coffee, MailCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz").max(255, "E-posta çok uzun"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").max(128, "Şifre çok uzun"),
});

const signupSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz").max(255, "E-posta çok uzun"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır").max(128, "Şifre çok uzun"),
  full_name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalıdır").max(100, "Ad soyad çok uzun"),
  phone: z.string().trim().max(20, "Telefon numarası çok uzun").optional().or(z.literal("")),
  store_name: z.string().trim().max(100, "Mağaza adı çok uzun").optional().or(z.literal("")),
  employment_date: z.string().optional().or(z.literal("")),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupStoreName, setSignupStoreName] = useState("");
  const [signupEmploymentDate, setSignupEmploymentDate] = useState("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });

    if (!validation.success) {
      toast({
        title: "Geçersiz Giriş",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "E-posta Doğrulanmamış",
            description: "Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.",
            variant: "destructive",
          });
        } else if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Giriş Başarısız",
            description: "E-posta veya şifre hatalı.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Hata",
            description: "Giriş yapılamadı. Lütfen tekrar deneyin.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Hoş Geldiniz!",
          description: "Başarıyla giriş yaptınız.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({
      email: signupEmail,
      password: signupPassword,
      full_name: signupFullName,
      phone: signupPhone,
      store_name: signupStoreName,
      employment_date: signupEmploymentDate,
    });

    if (!validation.success) {
      toast({
        title: "Geçersiz Bilgiler",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validation.data.full_name,
            phone: validation.data.phone || "",
            store_name: validation.data.store_name || "",
            employment_date: validation.data.employment_date || "",
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Kayıt Başarısız",
            description: "Bu e-posta adresi zaten kayıtlı.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Hata",
            description: "Kayıt yapılamadı. Lütfen tekrar deneyin.",
            variant: "destructive",
          });
        }
      } else {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'new_signup',
              email: validation.data.email,
              data: {
                userName: validation.data.full_name,
              },
            },
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        // Show email confirmation screen
        setConfirmationEmail(validation.data.email);
        setShowEmailConfirmation(true);
        setSignupEmail("");
        setSignupPassword("");
        setSignupFullName("");
        setSignupPhone("");
        setSignupStoreName("");
        setSignupEmploymentDate("");
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!confirmationEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: confirmationEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast({
        title: "Gönderildi",
        description: "Doğrulama e-postası tekrar gönderildi.",
      });
    } catch {
      toast({
        title: "Hata",
        description: "E-posta gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotEmailSent(true);
      toast({
        title: "E-posta Gönderildi",
        description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
      });
    } catch {
      toast({
        title: "Hata",
        description: "E-posta gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Forgot password screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md shadow-hover">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="TheCompany Coffee Academy" className="h-16" />
            </div>
            <div>
              <CardTitle className="text-2xl">Şifremi Unuttum</CardTitle>
              <CardDescription>
                {forgotEmailSent
                  ? "Şifre sıfırlama bağlantısı gönderildi"
                  : "E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {forgotEmailSent ? (
              <>
                <div className="bg-muted/50 rounded-lg p-4 text-center space-y-2">
                  <div className="flex justify-center mb-2">
                    <MailCheck className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Şifre sıfırlama bağlantısı şu adrese gönderildi:</p>
                  <p className="font-semibold text-foreground">{forgotEmail}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📧 E-posta kutunuzu kontrol edin ve bağlantıya tıklayın.</p>
                  <p>📁 E-postayı bulamıyorsanız spam/gereksiz klasörünüzü kontrol edin.</p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmailSent(false);
                    setForgotEmail("");
                  }}
                >
                  Giriş Sayfasına Dön
                </Button>
              </>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">E-posta Adresi</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail("");
                  }}
                >
                  Giriş Sayfasına Dön
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md shadow-hover">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">E-posta Doğrulama</CardTitle>
              <CardDescription className="mt-2">
                Hesabınız oluşturuldu! Giriş yapabilmek için e-posta adresinizi doğrulamanız gerekmektedir.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Doğrulama bağlantısı şu adrese gönderildi:</p>
              <p className="font-semibold text-foreground">{confirmationEmail}</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 E-posta kutunuzu kontrol edin ve doğrulama bağlantısına tıklayın.</p>
              <p>📁 E-postayı bulamıyorsanız spam/gereksiz klasörünüzü kontrol edin.</p>
              <p>⏳ E-posta doğrulandıktan sonra admin onayı beklemeniz gerekecektir.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleResendConfirmation}
                disabled={loading}
              >
                {loading ? "Gönderiliyor..." : "Doğrulama E-postasını Tekrar Gönder"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowEmailConfirmation(false)}
              >
                Giriş Sayfasına Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-hover">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="TheCompany Coffee Academy" className="h-16" />
          </div>
          <div>
            <CardTitle className="text-2xl">Hoş Geldiniz</CardTitle>
            <CardDescription>
              TheCompany Coffee Academy'ye giriş yapın veya yeni hesap oluşturun
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-posta</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Şifre</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    En az 6 karakter olmalıdır
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm h-auto"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotEmail(loginEmail);
                    }}
                  >
                    Şifremi Unuttum
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Ad Soyad *</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">E-posta *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-phone">Telefon</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-store">Mağaza Adı</Label>
                  <Input
                    id="signup-store"
                    type="text"
                    placeholder="Çalıştığınız mağaza"
                    value={signupStoreName}
                    onChange={(e) => setSignupStoreName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-employment-date">İşe Başlama Tarihi</Label>
                  <Input
                    id="signup-employment-date"
                    type="date"
                    value={signupEmploymentDate}
                    onChange={(e) => setSignupEmploymentDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Şifre *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    En az 8 karakter olmalıdır
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Kayıt sonrası e-posta doğrulaması ve admin onayı gerekmektedir.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
