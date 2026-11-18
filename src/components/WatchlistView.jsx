import { useEffect, useState } from "react";

const FILTER_STORAGE_KEY = "cineloom_watchlist_filter";

const FILTERS = [
  { id: "all", label: "All Saved" },
  { id: "want", label: "Want to Watch" },
  { id: "watching", label: "Currently Watching" },
  { id: "completed", label: "Completed" },
];

export default function WatchlistView({
  movies,
  stats,
  onOpenMovie,
  onRemoveMovie,
}) {
  const [filter, setFilter] = useState(
    () => localStorage.getItem(FILTER_STORAGE_KEY) || "all",
  );
  const visibleMovies =
    filter === "all" ? movies : movies.filter((movie) => movie.userStatus === filter);

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, filter);
  }, [filter]);

  return (
    <section className="mx-auto max-w-5xl space-y-7 px-5 pb-12 pt-28 md:px-10">
      <header className="flex flex-col justify-between gap-6 border-b border-black/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-netflix-butter">
            Your library
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-netflix-black">
            Watchlist
          </h1>
          <p className="mt-2 text-sm text-netflix-gray">
            Keep track of what you want to watch and what you have seen.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <StatCard value={stats.total} label="Saved" />
          <StatCard value={stats.completed} label="Watched" />
          <StatCard value={stats.hours} label="Est. hours" />
        </div>
      </header>

      <div className="flex items-center gap-5 overflow-x-auto border-b border-black/10">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`wl-tab whitespace-nowrap border-b-2 pb-3 text-xs transition-colors ${
              filter === item.id
                ? "border-netflix-darkred text-netflix-black"
                : "border-transparent text-netflix-gray hover:text-netflix-black"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visibleMovies.length ? (
          visibleMovies.map((movie) => (
            <article
              key={movie.id}
              className="group relative"
            >
              <button
                type="button"
                onClick={() => onOpenMovie(movie)}
                className="block w-full text-left"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-netflix-card">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://placehold.co/400x600/141414/ffffff?text=Cineloom";
                    }}
                    className="h-full w-full object-cover transition duration-200 group-hover:brightness-110"
                  />
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-netflix-lightgray">
                    {movie.userStatus}
                  </span>
                </div>
                <div className="pt-3">
                  <h2 className="truncate text-[13px] font-medium text-netflix-black">
                    {movie.title}
                  </h2>
                  <p className="mt-1 text-[11px] text-netflix-gray">
                    {movie.year} <span className="px-1 text-black/25">·</span>
                    <span className="text-netflix-lightgray">
                      <i className="fa-solid fa-star mr-1 text-netflix-butter" />
                      {movie.rating}
                    </span>
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onRemoveMovie(movie.id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/65 text-xs text-white/80 transition-colors hover:bg-black hover:text-white"
                title="Remove from watchlist"
                aria-label={`Remove ${movie.title} from watchlist`}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </article>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-sm text-netflix-gray">
            No movies found in this watchlist category. Explore the Discover tab
            to add movies!
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="text-left">
      <span className="text-lg font-medium text-netflix-black">{value}</span>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-netflix-gray">
        {label}
      </p>
    </div>
  );
}
