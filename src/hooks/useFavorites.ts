import { useCallback, useEffect, useState } from "react";
import type { FavoriteVideo } from "@/types";

const STORAGE_KEY = "vp_favorites";

function loadFavorites(): FavoriteVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteVideo[]>([]);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const save = useCallback((list: FavoriteVideo[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setFavorites(list);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (video: Omit<FavoriteVideo, "savedAt">) => {
      const existing = favorites.find((f) => f.id === video.id);
      if (existing) {
        save(favorites.filter((f) => f.id !== video.id));
      } else {
        save([{ ...video, savedAt: Date.now() }, ...favorites]);
      }
    },
    [favorites, save]
  );

  const removeFavorite = useCallback(
    (id: string) => {
      save(favorites.filter((f) => f.id !== id));
    },
    [favorites, save]
  );

  const clearFavorites = useCallback(() => {
    save([]);
  }, [save]);

  return { favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites };
}
