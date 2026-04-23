import { useRef, useState } from "react";
import scene1 from "@/assets/intro-scene-1.mp4.asset.json";
import scene2 from "@/assets/intro-scene-2.mp4.asset.json";
import scene3 from "@/assets/intro-scene-3.mp4.asset.json";
import scene4 from "@/assets/intro-scene-4.mp4.asset.json";
import scene5 from "@/assets/intro-scene-5.mp4.asset.json";
import scene6 from "@/assets/intro-scene-6.mp4.asset.json";

const scenes = [
  { url: scene1.url, title: "Sahne 1 — Sabah, dükkanı açış" },
  { url: scene2.url, title: "Sahne 2 — Makineyi hazırlama" },
  { url: scene3.url, title: "Sahne 3 — İlk müşteriyi karşılama" },
  { url: scene4.url, title: "Sahne 4 — Espresso ve süt köpürtme" },
  { url: scene5.url, title: "Sahne 5 — Latte art" },
  { url: scene6.url, title: "Sahne 6 — Servis ve gün batımı" },
];

const PreviewIntro = () => {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = () => {
    if (index < scenes.length - 1) {
      setIndex(index + 1);
    }
  };

  const handleRestart = () => {
    setIndex(0);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-white text-2xl font-bold">
        Pixel Art Açılış Videosu Önizleme (~60sn)
      </h1>
      <p className="text-white/60 text-sm">{scenes[index].title}</p>

      <video
        ref={videoRef}
        key={scenes[index].url}
        src={scenes[index].url}
        autoPlay
        muted
        playsInline
        controls
        onEnded={handleEnded}
        className="max-w-full max-h-[70vh] rounded-lg"
      />

      <div className="flex gap-2 flex-wrap justify-center">
        {scenes.map((s, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`px-3 py-1 rounded text-sm ${
              i === index
                ? "bg-primary text-primary-foreground"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={handleRestart}
          className="px-3 py-1 rounded text-sm bg-white/10 text-white hover:bg-white/20"
        >
          ⟲ Baştan
        </button>
      </div>

      <p className="text-white/50 text-xs max-w-md text-center">
        Sahneler otomatik sıralı oynar. Beğenirseniz "onayla" deyin, splash'i
        aktif edip 6 sahneyi peş peşe oynatacak şekilde site açılışına bağlarım.
      </p>
    </div>
  );
};

export default PreviewIntro;
