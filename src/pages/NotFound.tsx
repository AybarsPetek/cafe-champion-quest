import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Coffee, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title="Sayfa Bulunamadı" noIndex />
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Coffee className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-6xl font-bold mb-3 text-primary">404</h1>
        <h2 className="text-2xl font-bold mb-3">Bu fincan boş ☕</h2>
        <p className="text-muted-foreground mb-8">
          Aradığın sayfa demlenmemiş ya da başka bir yere taşınmış olabilir.
          Bir espresso içip ana sayfaya dönelim mi?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri dön
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
