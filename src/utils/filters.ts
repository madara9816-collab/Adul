import type { Video } from "@/types";
import type { FilterValues, DurationFilter, ResolutionFilter, DateFilter } from "@/components/FilterBar";

export function filterVideos(videos: Video[], filters: FilterValues): Video[] {
  let result = videos;

  const dur = filters.duration as DurationFilter;
  if (dur !== "any") {
    result = result.filter((v) => {
      const sec = parseInt(v.length, 10);
      if (isNaN(sec)) return false;
      if (dur === "short") return sec < 600;
      if (dur === "medium") return sec >= 600 && sec <= 1800;
      if (dur === "long") return sec > 1800;
      return true;
    });
  }

  const res = filters.resolution as ResolutionFilter;
  if (res !== "any") {
    result = result.filter((v) => {
      const q = (v.quality || "").toLowerCase();
      if (res === "hd") return q.includes("hd") || q.includes("720");
      if (res === "fullhd") return q.includes("1080") || q.includes("full");
      if (res === "4k") return q.includes("4k") || q.includes("2160");
      return false;
    });
  }

  const date = filters.date as DateFilter;
  if (date !== "any" && result.some((v) => v.added)) {
    const now = Date.now();
    const cutoff = date === "today" ? 86400000 : date === "week" ? 604800000 : 2592000000;
    result = result.filter((v) => {
      if (!v.added) return true;
      const d = new Date(v.added).getTime();
      return !isNaN(d) && now - d <= cutoff;
    });
  }

  return result;
}
