import type { VideoSearchResponse, SortOrder, Category, Country } from "@/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const PROXY_URL = `${SUPABASE_URL}/functions/v1/eporner-proxy`;

export const COUNTRIES: Country[] = [
  { id: "brazil", name: "Brasil", query: "brazilian", flag: "BR", keywords: ["brazilian", "brasil", "brazil", "brasilinha", "loira brasil", "morena brasil"] },
  { id: "latin", name: "América Latina", query: "latina", flag: "LATAM", keywords: ["latina", "latin", "mexican", "colombian", "argentinian", "venezuelan", "cuban", "peruvian", "chilean", "dominican"] },
  { id: "japan", name: "Japão", query: "japanese", flag: "JP", keywords: ["japanese", "japan", "jav", "asian", "oriental"] },
  { id: "usa", name: "Estados Unidos", query: "american", flag: "US", keywords: ["american", "usa", "united states"] },
  { id: "germany", name: "Alemanha", query: "german", flag: "DE", keywords: ["german", "germany", "deutsch"] },
  { id: "france", name: "França", query: "french", flag: "FR", keywords: ["french", "france", "francaise"] },
  { id: "uk", name: "Reino Unido", query: "british", flag: "GB", keywords: ["british", "uk", "england", "english"] },
  { id: "italy", name: "Itália", query: "italian", flag: "IT", keywords: ["italian", "italy", "italia"] },
  { id: "russia", name: "Rússia", query: "russian", flag: "RU", keywords: ["russian", "russia", "moscow"] },
  { id: "korea", name: "Coreia", query: "korean", flag: "KR", keywords: ["korean", "korea", "kpop"] },
  { id: "china", name: "China", query: "chinese", flag: "CN", keywords: ["chinese", "china", "cantonese"] },
  { id: "india", name: "Índia", query: "indian", flag: "IN", keywords: ["indian", "india", "desi", "hindi"] },
  { id: "czech", name: "República Tcheca", query: "czech", flag: "CZ", keywords: ["czech", "czech republic", "prague"] },
  { id: "spain", name: "Espanha", query: "spanish", flag: "ES", keywords: ["spanish", "spain", "espanol", "espanha"] },
  { id: "ebony", name: "Ebony", query: "ebony", flag: "AF", keywords: ["ebony", "black", "african"] },
  { id: "sweden", name: "Suécia", query: "swedish", flag: "SE", keywords: ["swedish", "sweden", "nordic", "scandinavian"] },
];

export const CATEGORIES: Category[] = [
  { id: "amateur", name: "Amador", query: "amateur", icon: "Users" },
  { id: "anal", name: "Anal", query: "anal", icon: "Heart" },
  { id: "blowjob", name: "Oral", query: "blowjob", icon: "Heart" },
  { id: "lesbian", name: "Lésbicas", query: "lesbian", icon: "Sparkles" },
  { id: "teen", name: "Jovens", query: "teen 18", icon: "Zap" },
  { id: "mature", name: "Maduras", query: "mature", icon: "Coffee" },
  { id: "milf", name: "MILF", query: "milf", icon: "Flame" },
  { id: "big-tits", name: "Peitos Grandes", query: "big tits", icon: "Star" },
  { id: "asian", name: "Asiáticas", query: "asian", icon: "Globe" },
  { id: "latina", name: "Latinas", query: "latina", icon: "Sun" },
  { id: "ebony", name: "Ebony", query: "ebony", icon: "Moon" },
  { id: "group", name: "Grupo", query: "group sex", icon: "Users" },
  { id: "public", name: "Público", query: "public", icon: "Eye" },
  { id: "cosplay", name: "Cosplay", query: "cosplay", icon: "Gamepad2" },
  { id: "pov", name: "POV", query: "pov", icon: "Camera" },
  { id: "verified", name: "Verificados", query: "verified amateurs", icon: "BadgeCheck" },
];

export const POPULAR_SEARCHES = [
  "amateur", "blowjob", "lesbian", "anal", "teen", "mature",
  "milf", "asian", "latina", "ebony", "threesome", "pov",
];

export interface SearchParams {
  query?: string;
  page?: number;
  per_page?: number;
  order?: SortOrder;
  source?: "all" | "eporner" | "redtube" | "pornhub" | "xvideos";
}

export async function searchVideos(params: SearchParams): Promise<VideoSearchResponse> {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set("query", params.query);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.per_page) searchParams.set("per_page", String(params.per_page));
  if (params.order) searchParams.set("order", params.order);
  if (params.source) searchParams.set("source", params.source);

  const url = `${PROXY_URL}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Falha na busca (${response.status})`);
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.videos)) {
    return {
      total: 0,
      current_page: 1,
      last_page: 1,
      per_page: params.per_page || 30,
      videos: [],
    };
  }

  return data as VideoSearchResponse;
}

export async function resolveXvideosVideo(alphaId: string): Promise<{ mp4_url: string | null; hls_url: string | null }> {
  const params = new URLSearchParams();
  params.set("action", "resolve_xvideos");
  params.set("video_id", alphaId);

  const url = `${PROXY_URL}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return { mp4_url: null, hls_url: null };
  }

  return response.json();
}
