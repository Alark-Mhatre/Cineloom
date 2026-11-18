import HeroSection from "./HeroSection.jsx";
import MovieCarousel from "./MovieCarousel.jsx";
import MovieSearchView from "./MovieSearchView.jsx";

export default function DiscoverView({
  sections,
  searchQuery,
  searchResults,
  isSearchLoading,
  searchError,
  onRetrySearch,
  isLoading,
  error,
  onRetry,
  watchlist,
  onOpenMovie,
  onAddToWatchlist,
}) {
  if (searchQuery.trim().length >= 2) {
    return (
      <MovieSearchView
        query={searchQuery.trim()}
        results={searchResults}
        isLoading={isSearchLoading}
        error={searchError}
        onRetry={onRetrySearch}
        watchlist={watchlist}
        onOpenMovie={onOpenMovie}
        onAddToWatchlist={onAddToWatchlist}
      />
    );
  }

  const featuredMovie = sections.find((section) => section.id === "trending-today")
    ?.movies[0];

  if (isLoading) {
    return (
      <div
        role="status"
        className="mx-auto flex min-h-[65vh] max-w-5xl items-center px-5 pt-20 text-sm text-netflix-gray md:px-10"
      >
        Loading movie lists from TMDb…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-5xl flex-col items-start justify-center gap-4 px-5 pt-20 md:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-netflix-butter">
          Movie data unavailable
        </p>
        <h1 className="max-w-2xl text-2xl font-medium text-netflix-black">
          Could not load movie lists.
        </h1>
        <p role="alert" className="max-w-2xl text-sm leading-6 text-netflix-gray">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-black/10 px-4 py-2 text-sm text-netflix-lightgray transition-colors hover:border-netflix-butter hover:text-netflix-butter"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!featuredMovie) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-5xl items-center px-5 pt-20 text-sm text-netflix-gray md:px-10">
        TMDb did not return any movies. Try again in a moment.
      </div>
    );
  }

  return (
    <div>
      <HeroSection
        movie={featuredMovie}
        isSaved={Boolean(watchlist[featuredMovie.id])}
        onOpenMovie={onOpenMovie}
        onAddToWatchlist={onAddToWatchlist}
      />
      <div className="space-y-10 px-5 py-8 md:px-10 md:py-10">
        {sections.map((section) => (
          <MovieCarousel
            key={section.id}
            {...section}
            watchlist={watchlist}
            onOpenMovie={onOpenMovie}
            onAddToWatchlist={onAddToWatchlist}
          />
        ))}
      </div>
    </div>
  );
}
