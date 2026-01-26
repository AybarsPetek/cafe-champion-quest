interface VideoPlayerProps {
  videoUrl: string | null;
  title: string;
  onVideoEnd?: () => void;
}

const VideoPlayer = ({ videoUrl, title, onVideoEnd }: VideoPlayerProps) => {
  const isDirectVideoUrl = (url: string): boolean => {
    // Check for direct video file extensions or Supabase storage URLs
    return (
      url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) !== null ||
      url.includes('supabase.co/storage') ||
      url.includes('/storage/v1/object/')
    );
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // Check if it's a direct video file first (including Supabase storage)
    if (isDirectVideoUrl(url)) {
      console.log('Direct/Storage video URL detected:', url);
      return url;
    }

    // YouTube URL patterns
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of youtubePatterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        console.log('YouTube video detected, ID:', videoId);
        return `https://www.youtube.com/embed/${videoId}?disablekb=1&fs=0&modestbranding=1&rel=0`;
      }
    }

    // Vimeo URL pattern
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch) {
      console.log('Vimeo video detected, ID:', vimeoMatch[1]);
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // If it's already an embed URL
    if (url.includes('embed')) {
      console.log('Embed URL detected:', url);
      return url;
    }

    console.log('No valid video URL pattern found for:', url);
    return null;
  };

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
  console.log('VideoPlayer - Input URL:', videoUrl, 'Embed URL:', embedUrl);

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

  // Check if it's a direct video file (including storage URLs)
  if (isDirectVideoUrl(embedUrl)) {
    return (
      <div className="relative aspect-video bg-black">
        <video
          className="w-full h-full"
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onEnded={onVideoEnd}
        >
          <source src={embedUrl} type="video/mp4" />
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
