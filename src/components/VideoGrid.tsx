import type { Video, FavoriteVideo } from "@/types";
import { VideoCard } from "@/components/VideoCard";
import type { Route } from "@/router";
import type { Video as RouteVideo } from "@/router";

interface VideoGridProps {
  videos: Video[] | FavoriteVideo[];
  navigate: (route: Route, video?: RouteVideo) => void;
  favorites: FavoriteVideo[];
  onToggleFavorite: (video: { id: string; title: string; thumbnail: string; length: string; url: string; url_embed: string | null }) => void;
}

export function VideoGrid({ videos, navigate, favorites, onToggleFavorite }: VideoGridProps) {
  const favIds = new Set(favorites.map((f) => f.id));

  if (videos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-2 xl:grid-cols-2">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video as Video}
          navigate={navigate}
          isFavorite={favIds.has(video.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
