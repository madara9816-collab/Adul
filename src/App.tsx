import { useCallback, useState } from "react";
import { useRouter } from "@/router";
import { useFavorites } from "@/hooks/useFavorites";
import { useCountryPreferences } from "@/hooks/useCountryPreferences";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { SearchPage } from "@/pages/SearchPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { CountryPage } from "@/pages/CountryPage";
import { VideoDetailPage } from "@/pages/VideoDetailPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { PrivacyPage, TermsPage, DmcaPage, ContactPage } from "@/pages/LegalPages";
import { AgeGate } from "@/components/AgeGate";
import { DEFAULT_FILTERS, type FilterValues } from "@/components/FilterBar";

function App() {
  const { route, navigate } = useRouter();
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const { favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites } = useFavorites();
  const {
    preferences,
    trackVideoView,
    trackVideoFavorite,
    setMode,
    setSelectedCountry,
    getActiveCountryQueries,
    getActiveCountryLabels,
  } = useCountryPreferences();

  const handleSearch = useCallback((query: string) => {
    navigate({ name: "search", query });
  }, [navigate]);

  const handleToggleFavorite = useCallback(
    (video: { id: string; title: string; thumbnail: string; length: string; url: string; url_embed: string | null }) => {
      toggleFavorite(video);
    },
    [toggleFavorite]
  );

  const activeCountryQueries = getActiveCountryQueries();
  const activeCountryLabels = getActiveCountryLabels();

  return (
    <div className="min-h-screen bg-[#20252a] text-[#d9e0e5]">
      <AgeGate />
      <Header
        navigate={navigate}
        onSearch={handleSearch}
        currentRoute={route}
        favoritesCount={favorites.length}
        countryMode={preferences.mode}
        selectedCountryId={preferences.selectedCountry}
        onSelectCountry={setSelectedCountry}
        onSetCountryMode={setMode}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <main className="mx-auto w-full max-w-[1560px] px-2 pt-14 pb-8 sm:px-3">
        {route.name === "home" && (
          <HomePage
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            countryMode={preferences.mode}
            selectedCountryId={preferences.selectedCountry}
            activeCountryLabels={activeCountryLabels}
            activeCountryQueries={activeCountryQueries}
            onSetCountryMode={setMode}
            filters={filters}
          />
        )}

        {route.name === "search" && route.query && (
          <SearchPage
            query={route.query}
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {route.name === "search" && !route.query && (
          <HomePage
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            countryMode={preferences.mode}
            selectedCountryId={preferences.selectedCountry}
            activeCountryLabels={activeCountryLabels}
            activeCountryQueries={activeCountryQueries}
            onSetCountryMode={setMode}
            filters={filters}
          />
        )}

        {route.name === "category" && (
          <CategoryPage
            categoryId={route.categoryId}
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {route.name === "country" && (
          <CountryPage
            countryId={route.countryId}
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {route.name === "video" && (
          <VideoDetailPage
            videoId={route.videoId}
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onTrackView={trackVideoView}
            onTrackFavorite={trackVideoFavorite}
          />
        )}

        {route.name === "favorites" && (
          <FavoritesPage
            favorites={favorites}
            removeFavorite={removeFavorite}
            clearFavorites={clearFavorites}
            navigate={navigate}
          />
        )}

        {route.name === "privacy" && <PrivacyPage navigate={navigate} />}
        {route.name === "terms" && <TermsPage navigate={navigate} />}
        {route.name === "dmca" && <DmcaPage navigate={navigate} />}
        {route.name === "contact" && <ContactPage navigate={navigate} />}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

export default App;
