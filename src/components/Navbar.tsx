import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, User, LogOut, Shield, Trophy, MessageCircle, Settings, Menu, X, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Çıkış Yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
    navigate("/");
  };

  const navItems = [
    { path: "/", label: "Ana Sayfa", icon: Home },
    { path: "/courses", label: "Eğitimler", icon: BookOpen },
    { path: "/library", label: "Kütüphane", icon: Library },
    { path: "/forum", label: "Forum", icon: MessageCircle },
    { path: "/leaderboard", label: "Sıralama", icon: Trophy },
    { path: "/dashboard", label: "Panelim", icon: User },
  ];

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            asChild
            className="w-full justify-start md:w-auto md:justify-center"
            onClick={onClick}
          >
            <Link to={item.path} className="gap-2">
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </Button>
        );
      })}
      
      {isAdmin && (
        <Button variant="outline" asChild className="w-full justify-start md:w-auto md:justify-center" onClick={onClick}>
          <Link to="/admin" className="gap-2">
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        </Button>
      )}
      
      {user ? (
        <>
          <Button variant="ghost" asChild className="w-full justify-start md:w-auto md:justify-center" onClick={onClick}>
            <Link to="/profile" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="md:hidden">Ayarlar</span>
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => { handleLogout(); onClick?.(); }} className="gap-2 w-full justify-start md:w-auto md:justify-center">
            <LogOut className="h-4 w-4" />
            <span>Çıkış</span>
          </Button>
        </>
      ) : (
        <Button asChild className="w-full md:w-auto" onClick={onClick}>
          <Link to="/auth">Giriş Yap</Link>
        </Button>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="TheCompany Coffee Academy" className="h-10" width={203} height={40} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menü</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col gap-1 p-4 pt-12">
                <SheetClose asChild>
                  <div className="flex flex-col gap-1">
                    <NavLinks />
                  </div>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
