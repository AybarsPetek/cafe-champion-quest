import { useRef, useState, useEffect } from "react";

interface VideoPlayerProps {
  videoUrl: string | null;
  title: string;
  onVideoEnd?: () => void;
}

const VideoPlayer = ({ videoUrl, title, onVideoEnd }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);

  const isDirectVideoUrl = (url: string): boolean => {
    return (
      url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) !== null ||
      url.includes('supabase.co/storage') ||
      url.includes('/storage/v1/object/')
    );
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    if (isDirectVideoUrl(url)) {
      console.log('Direct/Storage video URL detected:', url);
      return url;
    }

    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of youtubePatterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        console.log('YouTube video detected, ID:', videoId);
        // Disable keyboard, fullscreen, related videos, and annotations
        return `https://www.youtube.com/embed/${videoId}?disablekb=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3&controls=1`;
      }
    }

    const vimeoPattern = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch) {
      console.log('Vimeo video detected, ID:', vimeoMatch[1]);
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    if (url.includes('embed')) {
      console.log('Embed URL detected:', url);
      return url;
    }

    console.log('No valid video URL pattern found for:', url);
    return null;
  };

  // Reset max watched time when video URL changes
  useEffect(() => {
    setMaxWatchedTime(0);
  }, [videoUrl]);

  // Handle time update - track max watched position
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      // Only update max watched time if current time is slightly ahead (normal playback)
      if (video.currentTime <= maxWatchedTime + 1) {
        setMaxWatchedTime(Math.max(maxWatchedTime, video.currentTime));
      }
    }
  };

  // Prevent seeking beyond max watched time
  const handleSeeking = () => {
    const video = videoRef.current;
    if (video && video.currentTime > maxWatchedTime + 0.5) {
      console.log('Seeking prevented - max watched:', maxWatchedTime, 'attempted:', video.currentTime);
      video.currentTime = maxWatchedTime;
    }
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

  // Direct video file with seeking prevention
  if (isDirectVideoUrl(embedUrl)) {
    return (
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onEnded={onVideoEnd}
        >
          <source src={embedUrl} type="video/mp4" />
          Tarayıcınız video oynatmayı desteklemiyor.
        </video>
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
          İleri sarma devre dışı
        </div>
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
        className="absolute inset-0 w-full h-full rounded-lg"
      />
      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
        ⚠️ YouTube videolarında ileri sarma kısıtlaması sınırlıdır
      </div>
    </div>
  );
};

export default VideoPlayer;
