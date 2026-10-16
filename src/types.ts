export interface Video {
  id: string;
  title: string;
  url: string;
  url_embed: string | null;
  thumbnail: string;
  length: string;
  quality: string | null;
  views: number;
  rate: string;
  tags: string[];
  pornstar: string[];
  added: string;
  source: string;
}

export interface VideoSearchResponse {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
  videos: Video[];
}

export type SortOrder = "latest" | "longest" | "toprated" | "mostviewed" | "relevance";

export interface FavoriteVideo {
  id: string;
  title: string;
  thumbnail: string;
  length: string;
  url: string;
  url_embed: string | null;
  savedAt: number;
}

export interface Category {
  id: string;
  name: string;
  query: string;
  icon: string;
}

export interface Country {
  id: string;
  name: string;
  query: string;
  flag: string;
  keywords: string[];
}

export type CountryFilterMode = "all" | "auto" | "manual";

export interface CountryPreferences {
  mode: CountryFilterMode;
  selectedCountry: string | null;
  scores: Record<string, number>;
}
