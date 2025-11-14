interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  // YouTube video ID'sini çıkar
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);

  if (youtubeId) {
    return (
      <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-black">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Recipe Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Diğer video URL'leri için
  return (
    <div className="rounded-lg overflow-hidden bg-black">
      <video controls className="w-full">
        <source src={videoUrl} />
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>
    </div>
  );
}
