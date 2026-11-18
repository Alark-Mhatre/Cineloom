import MovieCard from "./MovieCard.jsx";

export default function MovieSearchView({
  query,
  results,
  isLoading,
  error,
  onRetry,
  watchlist,
  onOpenMovie,
  onAddToWatchlist,
}) {
  return (
    <section className="mx-auto min-h-[65vh] max-w-7xl px-5 pb-12 pt-28 md:px-10">
      <header className="mb-7 border-b border-black/10 pb-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-netflix-butter">
          Movie search
        </p>
        <h1 className="text-2xl font-medium text-netflix-black sm:text-3xl">
          Results for <span className="text-netflix-lightgray">“{query}”</span>
        </h1>
      </header>

      {isLoading ? (
        <p role="status" className="py-12 text-sm text-netflix-gray">
          Searching TMDb…
        </p>
      ) : error ? (
        <div className="flex flex-col items-start gap-4 py-8">
          <p role="alert" className="text-sm text-netflix-gray">
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-black/10 px-4 py-2 text-xs text-netflix-lightgray transition-colors hover:border-netflix-butter hover:text-netflix-butter"
          >
            Try again
          </button>
        </div>
      ) : results.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              layout="grid"
              isSaved={Boolean(watchlist[movie.id])}
              onOpen={onOpenMovie}
              onAddToWatchlist={onAddToWatchlist}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-sm text-netflix-gray">
          No movies found for “{query}”. Try another title.
        </p>
      )}
    </section>
  );
}
