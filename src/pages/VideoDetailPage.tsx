import { useEffect, useState, useCallback } from "react";
import {
  Play, Heart, Share2, ExternalLink, Clock, Eye, Star,
  Tag, AlertCircle, ArrowLeft, ThumbsUp, ThumbsDown, Flag, X,
} from "lucide-react";
import { searchVideos, resolveXvideosVideo } from "@/services/api";
import type { Video, FavoriteVideo } from "@/types";
import { formatLength, formatViews } from "@/utils/format";
import { getStoredVideo } from "@/utils/videoStore";
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridSkeleton } from "@/components/Skeletons";
import { ErrorState } from "@/components/States";
import type { Route, Video as RouteVideo } from "@/router";

interface VideoDetailPageProps {
  videoId: string;
  navigate: (route: Route, video?: RouteVideo) => void;
  favorites: FavoriteVideo[];
  onToggleFavorite: (video: { id: string; title: string; thumbnail: string; length: string; url: string; url_embed: string | null }) => void;
  onTrackView: (tags: string[]) => void;
  onTrackFavorite: (tags: string[]) => void;
}

export function VideoDetailPage({ videoId, navigate, favorites, onToggleFavorite, onTrackView, onTrackFavorite }: VideoDetailPageProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [userRating, setUserRating] = useState<"up" | "down" | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [xvMp4, setXvMp4] = useState<string | null>(null);
  const [xvLoading, setXvLoading] = useState(false);

  const isFav = favorites.some((f) => f.id === videoId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const stored = getStoredVideo();
    if (stored && stored.id === videoId) {
      setVideo(stored);
      setLoading(false);
      const relatedQuery = stored.tags.length > 0 ? stored.tags[0] : stored.title.split(" ").slice(0, 3).join(" ");
      try {
        const relatedResult = await searchVideos({ query: relatedQuery, per_page: 12 });
        setRelated(relatedResult.videos.filter((v) => v.id !== videoId).slice(0, 10));
      } catch {
        setRelated([]);
      }
      return;
    }

    try {
      const rawId = videoId.replace(/^(ep_|rt_|ph_|xv_)/, "");
      const sourceFilter = videoId.startsWith("ep_") ? "eporner" : videoId.startsWith("rt_") ? "redtube" : videoId.startsWith("ph_") ? "pornhub" : videoId.startsWith("xv_") ? "xvideos" : "all";
      const titleWords = rawId.split(/[-_]/).filter(Boolean);
      const searchQuery = titleWords.slice(0, 3).join(" ");
      const result = await searchVideos({ query: searchQuery || rawId, per_page: 50, source: sourceFilter as "all" | "eporner" | "redtube" | "pornhub" | "xvideos" });
      const found = result.videos.find((v) => v.id === videoId);
      if (!found) {
        setError("Vídeo não encontrado. Ele pode ter sido removido da fonte.");
        return;
      }
      setVideo(found);

      const relatedQuery = found.tags.length > 0 ? found.tags[0] : found.title.split(" ").slice(0, 3).join(" ");
      const relatedResult = await searchVideos({ query: relatedQuery, per_page: 12 });
      setRelated(relatedResult.videos.filter((v) => v.id !== videoId).slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar vídeo");
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    load();
    setShowEmbed(false);
    setXvMp4(null);
  }, [load]);

  const handleXvideosPlay = useCallback(async () => {
    if (!video || !video.id.startsWith("xv_")) return;
    setXvLoading(true);
    const alphaId = video.id.replace(/^xv_/, "");
    const result = await resolveXvideosVideo(alphaId);
    setXvMp4(result.mp4_url);
    setXvLoading(false);
  }, [video]);

  useEffect(() => {
    if (video && video.tags.length > 0) {
      onTrackView(video.tags);
    }
  }, [video, onTrackView]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ url, title: video?.title }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-neutral-900 rounded-xl animate-pulse" />
        <div className="h-6 bg-neutral-900 rounded w-2/3 animate-pulse" />
        <VideoGridSkeleton count={5} />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate({ name: "home" })}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <ErrorState message={error || "Vídeo não encontrado"} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate({ name: "home" })}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="space-y-4">
        {video.url_embed && showEmbed ? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
              src={video.url_embed}
              className="w-full h-full"
              allowFullScreen
              title={video.title}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : xvMp4 ? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <video
              src={xvMp4}
              className="w-full h-full"
              controls
              autoPlay
              title={video.title}
            />
          </div>
        ) : (
          <div className="relative aspect-video bg-neutral-900 rounded-xl overflow-hidden group">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3C/svg%3E";
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              {video.url_embed ? (
                <button
                  onClick={() => setShowEmbed(true)}
                  className="flex flex-col items-center gap-3 group/play"
                >
                  <div className="w-16 h-16 rounded-full bg-red-600 group-hover/play:bg-red-500 flex items-center justify-center transition-colors shadow-lg shadow-red-500/30">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                  <span className="text-white text-sm font-medium">Reproduzir vídeo</span>
                </button>
              ) : video.source === "xvideos" ? (
                <button
                  onClick={handleXvideosPlay}
                  disabled={xvLoading}
                  className="flex flex-col items-center gap-3 group/play"
                >
                  <div className="w-16 h-16 rounded-full bg-red-600 group-hover/play:bg-red-500 flex items-center justify-center transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50">
                    {xvLoading ? (
                      <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    )}
                  </div>
                  <span className="text-white text-sm font-medium">
                    {xvLoading ? "Carregando..." : "Reproduzir vídeo"}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-neutral-400" />
                  </div>
                  <span className="text-neutral-300 text-sm">Player não disponível</span>
                  {video.url && (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Ver na fonte original
                    </a>
                  )}
                </div>
              )}
            </div>
            {video.length && (
              <span className="absolute bottom-3 right-3 px-2 py-1 text-sm font-medium text-white bg-black/80 rounded">
                {formatLength(video.length)}
              </span>
            )}
          </div>
        )}

        <div>
          <h1 className="text-lg md:text-xl font-bold text-white leading-snug">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-500">
            {video.length && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {formatLength(video.length)}
              </span>
            )}
            {video.views > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {formatViews(video.views)} views
              </span>
            )}
            {video.rate && (
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500" /> {video.rate}%
              </span>
            )}
            {video.quality && (
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded">
                {video.quality}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => {
                onToggleFavorite({
                  id: video.id,
                  title: video.title,
                  thumbnail: video.thumbnail,
                  length: video.length,
                  url: video.url,
                  url_embed: video.url_embed,
                });
                if (!isFav && video.tags.length > 0) {
                  onTrackFavorite(video.tags);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isFav
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
              {isFav ? "Favoritado" : "Favoritar"}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {shareCopied ? "Link copiado!" : "Compartilhar"}
            </button>

            {video.url && (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Fonte original
              </a>
            )}

            <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setUserRating(userRating === "up" ? null : "up")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  userRating === "up" ? "bg-green-600 text-white" : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <ThumbsUp className="w-4 h-4" /> Gostei
              </button>
              <button
                onClick={() => setUserRating(userRating === "down" ? null : "down")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  userRating === "down" ? "bg-red-600 text-white" : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <ThumbsDown className="w-4 h-4" /> Não gostei
              </button>
            </div>

            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Flag className="w-4 h-4" /> Denunciar
            </button>
          </div>
        </div>

        {showReport && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" /> Denunciar conteúdo
                </h3>
                <button onClick={() => setShowReport(false)} className="text-neutral-500 hover:text-neutral-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {reportSent ? (
                <p className="text-sm text-green-400 py-4 text-center">
                  Denúncia registrada. Nossa equipe irá revisar o conteúdo em até 24h.
                </p>
              ) : (
                <>
                  <p className="text-sm text-neutral-400">
                    Selecione o motivo da denúncia. Todo conteúdo ilegal será removido imediatamente.
                  </p>
                  <div className="space-y-2">
                    {[
                      "Conteúdo envolvendo menores de idade",
                      "Material sem consentimento",
                      "Violação de direitos autorais (DMCA)",
                      "Conteúdo ilegal ou proibido",
                      "Outro motivo",
                    ].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => {
                          setReportSent(true);
                          setTimeout(() => { setShowReport(false); setReportSent(false); }, 2500);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600">
                    Proibimos rigorosamente conteúdo envolvendo menores, material sem consentimento e qualquer conteúdo ilegal.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {video.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => navigate({ name: "search", query: tag })}
                  className="px-3 py-1 text-xs bg-neutral-800 hover:bg-red-500/20 hover:text-red-300 text-neutral-300 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {video.pornstar.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4" /> Modelos
            </h3>
            <div className="flex flex-wrap gap-2">
              {video.pornstar.map((name, i) => (
                <button
                  key={i}
                  onClick={() => navigate({ name: "search", query: name })}
                  className="px-3 py-1 text-xs bg-neutral-800 hover:bg-red-500/20 hover:text-red-300 text-neutral-300 rounded-full transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Vídeos relacionados</h2>
          <VideoGrid
            videos={related}
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      )}
    </div>
  );
}
