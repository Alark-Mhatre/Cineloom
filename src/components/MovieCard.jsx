export default function MovieCard({
  movie,
  isSaved,
  onOpen,
  onAddToWatchlist,
  layout = "carousel",
}) {
  const layoutClass =
    layout === "grid" ? "w-full" : "w-40 flex-shrink-0 md:w-48";

  return (
    <article
      className={`movie-card group relative ${layoutClass} overflow-hidden rounded-md`}
    >
      <button
        type="button"
        onClick={() => onOpen(movie)}
        className="block w-full cursor-pointer text-left"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-netflix-card">
          <img
            src={movie.poster}
            alt={movie.title}
            onError={(event) => {
              event.currentTarget.src =
                "https://placehold.co/400x600/141414/ffffff?text=Cineloom";
            }}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/65 px-2 py-1 text-[10px] font-medium text-netflix-lightgray">
            <i className="fa-solid fa-star text-netflix-butter" />
            <span className="text-white">{movie.rating}</span>
          </div>
        </div>
        <div className="px-0.5 pt-3">
          <h3 className="truncate text-[13px] font-medium text-netflix-black">
            {movie.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-netflix-gray">
            <span>{movie.year}</span>
            <span className="text-black/25">·</span>
            <span>{movie.genres[0]}</span>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onAddToWatchlist(movie)}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-black/65 text-white/80 transition-colors hover:border-netflix-red hover:text-netflix-red"
        title={isSaved ? "Already in your watchlist" : "Add to Watchlist"}
        aria-label={
          isSaved
            ? `${movie.title} is already in your watchlist`
            : `Add ${movie.title} to your watchlist`
        }
      >
        <i
          className={`fa-solid ${
            isSaved ? "fa-check text-netflix-red" : "fa-plus"
          }`}
        />
      </button>
    </article>
  );
}
