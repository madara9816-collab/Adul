import type { Video } from "@/types";

const STORAGE_KEY = "vp_current_video";

export function storeVideo(video: Video): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(video));
  } catch {}
}

export function getStoredVideo(): Video | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Video;
  } catch {
    return null;
  }
}
