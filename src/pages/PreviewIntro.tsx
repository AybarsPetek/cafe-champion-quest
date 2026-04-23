import baristaIntro from "@/assets/barista-intro.mp4.asset.json";

const PreviewIntro = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-white text-2xl font-bold">Açılış Videosu Önizleme</h1>
      <video
        src={baristaIntro.url}
        controls
        autoPlay
        className="max-w-full max-h-[80vh] rounded-lg"
      />
      <p className="text-white/60 text-sm">
        Onayladıktan sonra bu sayfa kaldırılacak ve video site açılışında oynayacak.
      </p>
    </div>
  );
};

export default PreviewIntro;
