export default function HeroSection({
  movie,
  isSaved,
  onOpenMovie,
  onAddToWatchlist,
}) {
  return (
    <section
      className="hero-poster relative flex h-[70vh] min-h-[520px] max-h-[760px] w-full items-end bg-cover bg-center px-5 pb-12 pt-24 md:px-10 md:pb-16"
      style={{ backgroundImage: `url("${movie.backdrop}")` }}
    >
      <div className="hero-gradient absolute inset-0" />
      <div className="hero-bottom-gradient absolute inset-0" />
      <div className="relative z-10 max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-medium uppercase tracking-[0.18em] text-netflix-red">
            Featured film
          </span>
          <span className="text-white/35">/</span>
          <span className="text-netflix-lightgray">
            {movie.year} <span className="px-1 text-white/35">·</span>{" "}
            {movie.runtime}
          </span>
          <span className="flex items-center gap-1 text-netflix-lightgray">
            <i className="fa-solid fa-star text-netflix-red" />
            {movie.rating}
          </span>
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
          {movie.title}
        </h1>
        <p className="line-clamp-3 max-w-xl text-sm leading-7 text-white/75 md:text-base">
          {movie.overview}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenMovie(movie)}
            className="flex items-center gap-2 rounded-md border border-white/25 bg-black/20 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <i className="fa-solid fa-circle-info text-xs" />
            <span>Details</span>
          </button>
          <button
            type="button"
            onClick={() => onAddToWatchlist(movie.id)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/25 bg-black/20 text-white transition-colors hover:bg-white/10"
            title={isSaved ? "Already in your watchlist" : "Add to Watchlist"}
            aria-label={
              isSaved
                ? `${movie.title} is already in your watchlist`
                : `Add ${movie.title} to your watchlist`
            }
          >
            <i className={`fa-solid ${isSaved ? "fa-check" : "fa-plus"}`} />
          </button>
        </div>
      </div>
    </section>
  );
}
