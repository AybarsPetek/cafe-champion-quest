interface VideoPlayerProps {
  videoUrl: string | null;
  title: string;
}

const VideoPlayer = ({ videoUrl, title }: VideoPlayerProps) => {
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // YouTube URL patterns
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of youtubePatterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?rel=0`;
      }
    }

    // Vimeo URL pattern
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // If it's already an embed URL or direct video file
    if (url.includes('embed') || url.match(/\.(mp4|webm|ogg)$/)) {
      return url;
    }

    return null;
  };

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  if (!embedUrl) {
    return (
      <div className="relative aspect-video bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">Video yüklenemedi</p>
          <p className="text-sm">Geçerli bir video URL'si giriniz</p>
        </div>
      </div>
    );
  }

  // Check if it's a direct video file
  if (embedUrl.match(/\.(mp4|webm|ogg)$/)) {
    return (
      <div className="relative aspect-video bg-black">
        <video
          className="w-full h-full"
          controls
          controlsList="nodownload"
        >
          <source src={embedUrl} type={`video/${embedUrl.split('.').pop()}`} />
          Tarayıcınız video oynatmayı desteklemiyor.
        </video>
      </div>
    );
  }

  // Embed iframe for YouTube, Vimeo, etc.
  return (
    <div className="relative aspect-video">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
      />
    </div>
  );
};

export default VideoPlayer;
