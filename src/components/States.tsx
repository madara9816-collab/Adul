import { AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-200 mb-2">{t("common.error")}</h3>
      <p className="text-sm text-neutral-500 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> {t("common.retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-neutral-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-200 mb-2">{t("search.noResults")}</h3>
      <p className="text-sm text-neutral-500 max-w-md">{message}</p>
    </div>
  );
}
