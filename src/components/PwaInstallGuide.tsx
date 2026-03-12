import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Share, MoreVertical, PlusSquare, Download, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "pwa-install-guide-seen";

const PwaInstallGuide = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show only if not seen before and not already running as PWA
    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (!alreadySeen && !isStandalone) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Uygulamayı Telefonunuza Ekleyin
          </DialogTitle>
          <DialogDescription>
            Bu portalı telefonunuzun ana ekranına ekleyerek bir uygulama gibi kullanabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="android" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="ios">iPhone / iPad</TabsTrigger>
          </TabsList>

          <TabsContent value="android" className="space-y-4 pt-2">
            <div className="space-y-3">
              <Step
                number={1}
                icon={<MoreVertical className="h-4 w-4" />}
                text='Chrome tarayıcısında sağ üstteki üç nokta (⋮) menüsüne dokunun.'
              />
              <Step
                number={2}
                icon={<Download className="h-4 w-4" />}
                text='"Ana ekrana ekle" veya "Uygulamayı yükle" seçeneğine dokunun.'
              />
              <Step
                number={3}
                icon={<CheckCircle2 className="h-4 w-4" />}
                text='Açılan onay ekranında "Ekle" veya "Yükle" butonuna basın.'
              />
            </div>
            <p className="text-xs text-muted-foreground">
              * Samsung Internet tarayıcısında da aynı adımlar geçerlidir.
            </p>
          </TabsContent>

          <TabsContent value="ios" className="space-y-4 pt-2">
            <div className="space-y-3">
              <Step
                number={1}
                icon={<Share className="h-4 w-4" />}
                text="Safari tarayıcısında alt kısımdaki paylaş (↑) butonuna dokunun."
              />
              <Step
                number={2}
                icon={<PlusSquare className="h-4 w-4" />}
                text='Açılan menüde aşağı kaydırarak "Ana Ekrana Ekle" seçeneğine dokunun.'
              />
              <Step
                number={3}
                icon={<CheckCircle2 className="h-4 w-4" />}
                text='Sağ üstteki "Ekle" butonuna basarak uygulamayı ana ekranınıza ekleyin.'
              />
            </div>
            <p className="text-xs text-muted-foreground">
              * Bu işlem yalnızca Safari tarayıcısında çalışır. Chrome veya diğer tarayıcılarda desteklenmez.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Anladım
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Step = ({ number, icon, text }: { number: number; icon: React.ReactNode; text: string }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
      {number}
    </div>
    <div className="flex items-start gap-2 pt-0.5">
      <span className="shrink-0 mt-0.5 text-primary">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  </div>
);

export default PwaInstallGuide;
