import { SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { SortOrder } from "@/types";

export type DurationFilter = "any" | "short" | "medium" | "long";
export type ResolutionFilter = "any" | "hd" | "fullhd" | "4k";
export type DateFilter = "any" | "today" | "week" | "month";
export type SourceFilter = "all" | "eporner" | "redtube" | "pornhub" | "xvideos";

export interface FilterValues {
  order: SortOrder;
  duration: DurationFilter;
  resolution: ResolutionFilter;
  date: DateFilter;
  source: SourceFilter;
}

export const DEFAULT_FILTERS: FilterValues = {
  order: "latest",
  duration: "any",
  resolution: "any",
  date: "any",
  source: "all",
};

interface FilterBarProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  total?: number;
}

export function FilterBar({ filters, onChange, total }: FilterBarProps) {
  const { t } = useLanguage();

  const SORT_OPTIONS = [
    { value: "latest", label: t("filter.sort.latest") },
    { value: "mostviewed", label: t("filter.sort.mostviewed") },
    { value: "toprated", label: t("filter.sort.toprated") },
    { value: "longest", label: t("filter.sort.longest") },
    { value: "relevance", label: t("filter.sort.relevance") },
  ];

  const DURATION_OPTIONS = [
    { value: "any", label: t("filter.durationAll") },
    { value: "short", label: t("filter.durationShort") },
    { value: "medium", label: t("filter.durationMedium") },
    { value: "long", label: t("filter.durationLong") },
  ];

  const RESOLUTION_OPTIONS = [
    { value: "any", label: t("filter.qualityAll") },
    { value: "hd", label: "HD" },
    { value: "fullhd", label: "Full HD" },
    { value: "4k", label: "4K" },
  ];

  const DATE_OPTIONS = [
    { value: "any", label: t("filter.durationAll") },
    { value: "today", label: "HD" },
    { value: "week", label: "Full HD" },
    { value: "month", label: "4K" },
  ];

  const SOURCE_OPTIONS = [
    { value: "all", label: t("filter.sourceAll") },
    { value: "eporner", label: "Eporner" },
    { value: "redtube", label: "RedTube" },
    { value: "pornhub", label: "PornHub" },
    { value: "xvideos", label: "XVideos" },
  ];

  const hasActiveFilters =
    filters.duration !== "any" ||
    filters.resolution !== "any" ||
    filters.date !== "any" ||
    filters.source !== "all";

  const update = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const selectClass =
    "bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500/60 cursor-pointer";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs font-medium">{t("filter.sort")}</span>
          </div>
          <select
            value={filters.order}
            onChange={(e) => update("order", e.target.value)}
            className={selectClass}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {total !== undefined && total > 0 && (
          <span className="text-xs text-neutral-500">{total} {t("video.views").replace("visualizações", "vídeos")}</span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-neutral-500">Filtros:</span>

        <label className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500">{t("filter.duration")}</span>
          <select value={filters.duration} onChange={(e) => update("duration", e.target.value)} className={selectClass}>
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500">{t("filter.quality")}</span>
          <select value={filters.resolution} onChange={(e) => update("resolution", e.target.value)} className={selectClass}>
            {RESOLUTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500">Data</span>
          <select value={filters.date} onChange={(e) => update("date", e.target.value)} className={selectClass}>
            {DATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500">{t("filter.source")}</span>
          <select value={filters.source} onChange={(e) => update("source", e.target.value)} className={selectClass}>
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ ...filters, duration: "any", resolution: "any", date: "any", source: "all" })}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-3 h-3" /> {t("common.close")}
          </button>
        )}
      </div>
    </div>
  );
}
