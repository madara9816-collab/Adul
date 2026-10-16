import { Heart, Clock, Eye, Play } from "lucide-react";
import type { Video, FavoriteVideo } from "@/types";
import { formatLength, formatViews, formatRelativeDate } from "@/utils/format";
import type { Route, Video as RouteVideo } from "@/router";

interface VideoCardProps {
  video: Video;
  navigate: (route: Route, video?: RouteVideo) => void;
  isFavorite: boolean;
  onToggleFavorite: (video: Omit<FavoriteVideo, "savedAt">) => void;
}

export function VideoCard({ video, navigate, isFavorite, onToggleFavorite }: VideoCardProps) {
  return (
    <article
      className="group relative cursor-pointer overflow-hidden rounded-sm border border-[#343b42] bg-[#15191d] transition-all duration-200 hover:border-[#a6d36a]/70"
      onClick={() => navigate({ name: "video", videoId: video.id }, video)}
    >
      <div className="flex h-[2.5rem] items-center border-b border-[#343b42] bg-[#1b2025] px-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-[#d8e0e5] group-hover:text-[#c7e875]">
          {video.title}
        </h3>
      </div>

      <div className="relative aspect-video overflow-hidden bg-[#0e1113]">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
            event.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%2315191d'/%3E%3C/svg%3E";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b9dc4f]/90">
            <Play className="ml-0.5 h-4 w-4 fill-[#172016] text-[#172016]" />
          </div>
        </div>
        {video.quality && (
          <span className="absolute left-1.5 top-1.5 rounded-sm bg-[#b9dc4f] px-1.5 py-0.5 text-[10px] font-bold text-[#172016]">
            {video.quality}
          </span>
        )}
        {video.length && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/85 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Clock className="h-3.5 w-3.5" />
            {formatLength(video.length)}
          </span>
        )}
        <button
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onToggleFavorite({
              id: video.id,
              title: video.title,
              thumbnail: video.thumbnail,
              length: video.length,
              url: video.url,
              url_embed: video.url_embed,
            });
          }}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-sm bg-black/65 opacity-0 transition-all hover:bg-black/90 group-hover:opacity-100"
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-[#343b42] bg-[#1b2025] px-3 py-1.5 text-xs text-[#7f8b94]">
        {video.views > 0 && (
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-[#a6d36a]" />
            {formatViews(video.views)}
          </span>
        )}
        {video.added && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeDate(video.added)}
          </span>
        )}
      </div>
    </article>
  );
}
