import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ShortLinkRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      if (!code) {
        setError("Geçersiz link");
        return;
      }
      try {
        const { data, error: dbError } = await supabase
          .from("short_links")
          .select("target_url, expires_at")
          .eq("code", code)
          .maybeSingle();

        if (dbError || !data) {
          setError("Bu şifre oluşturma linki geçersiz veya silinmiş.");
          return;
        }
        if (new Date(data.expires_at) < new Date()) {
          setError("Linkin süresi doldu. Lütfen yöneticinizden yeni bir link isteyin.");
          return;
        }
        window.location.replace(data.target_url);
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu");
      }
    };
    resolve();
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <h1 className="text-2xl font-bold mb-3">Link Geçersiz</h1>
            <p className="text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Yönlendiriliyorsunuz...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ShortLinkRedirect;
