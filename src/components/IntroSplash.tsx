import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import baristaIntro from "@/assets/barista-intro.mp4.asset.json";

const STORAGE_KEY = "intro_splash_shown";

const IntroSplash = () => {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(STORAGE_KEY);
  });
  const [fadingOut, setFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!show) return;
    // Lock body scroll while splash is visible
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [show]);

  const handleEnd = () => {
    setFadingOut(true);
    setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setShow(false);
    }, 600);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        src={baristaIntro.url}
        autoPlay
        muted
        playsInline
        onEnded={handleEnd}
        className="w-full h-full object-cover animate-fade-in"
      />

      {/* Brand overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-16 md:pb-24 bg-gradient-to-t from-black/70 via-transparent to-black/30">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wide animate-fade-in text-center px-4">
          TheCompany Coffee Academy
        </h1>
        <p className="text-sm md:text-base text-white/80 mt-3 animate-fade-in text-center px-4">
          Çekirdekten fincana, profesyonel barista yolculuğu
        </p>
      </div>

      {/* Skip button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleEnd}
        className="absolute top-4 right-4 md:top-6 md:right-6 gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
      >
        Atla
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default IntroSplash;
