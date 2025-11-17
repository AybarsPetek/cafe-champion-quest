import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const PendingApproval = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const checkApprovalStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUserEmail(session.user.email || "");

      // Check if user is approved
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', session.user.id)
        .single();

      if (profile?.is_approved) {
        navigate("/");
      }
    };

    checkApprovalStatus();

    // Listen for profile changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          checkApprovalStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="TheCompany Coffee Academy" className="h-16" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Onay Bekleniyor</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Merhaba, <span className="font-semibold text-foreground">{userEmail}</span>
            </p>
            <p className="text-muted-foreground">
              Hesabınız başarıyla oluşturuldu! Ancak sisteme erişebilmeniz için yönetici onayı beklemeniz gerekmektedir.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Hesabınız onaylandığında otomatik olarak yönlendirileceksiniz. 
                Lütfen sabırlı olun ve sayfayı kapatmayın.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
