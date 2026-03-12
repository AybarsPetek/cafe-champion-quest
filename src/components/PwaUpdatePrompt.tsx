import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const PwaUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Yeni güncelleme mevcut</p>
          <p className="text-xs text-muted-foreground">Uygulamayı güncellemek için tıklayın</p>
        </div>
        <Button
          size="sm"
          onClick={() => updateServiceWorker(true)}
        >
          Güncelle
        </Button>
      </div>
    </div>
  );
};

export default PwaUpdatePrompt;
