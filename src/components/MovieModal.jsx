import { useState } from "react";

function formatCurrency(amount) {
  return amount > 0
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(amount)
    : "Not disclosed";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function CastPortrait({ person }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = person.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-netflix-page via-netflix-card to-netflix-gray">
      {person.profile && !imageFailed ? (
        <img
          src={person.profile}
          alt={`Portrait of ${person.name}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full items-center justify-center font-serif text-3xl tracking-widest text-netflix-butter"
        >
          {initials}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
    </div>
  );
}

export default function MovieModal({
  movie,
  detailsStatus,
  detailsError,
  watchlistEntry,
  onClose,
  onUpdateStatus,
}) {
  if (!movie) return null;

  const isLoading = detailsStatus === "loading";
  const unavailable = isLoading ? "Loading…" : "Not listed";
  const currentStatus = watchlistEntry?.status ?? "none";
  const language = movie.originalLanguage
    ? new Intl.DisplayNames(["en"], { type: "language" }).of(
        movie.originalLanguage,
      ) || movie.originalLanguage.toUpperCase()
    : unavailable;
  const facts = [
    { label: "Runtime", value: movie.runtime || unavailable },
    { label: "Release date", value: formatDate(movie.releaseDate) || movie.year },
    {
      label: "Budget",
      value:
        movie.budget > 0
          ? formatCurrency(movie.budget)
          : isLoading
            ? unavailable
            : "Not disclosed",
    },
    {
      label: "Box office",
      value:
        movie.revenue > 0
          ? formatCurrency(movie.revenue)
          : isLoading
            ? unavailable
            : "Not listed",
    },
    {
      label: "TMDb score",
      value:
        movie.tmdbRating != null
          ? `${movie.tmdbRating.toFixed(1)} / 10`
          : `${movie.rating} / 5`,
    },
    {
      label: "Votes",
      value:
        movie.voteCount > 0
          ? movie.voteCount.toLocaleString("en-US")
          : unavailable,
    },
    { label: "Status", value: movie.status || unavailable },
    { label: "Original language", value: language },
    { label: "Director", value: movie.director || unavailable },
    {
      label: "Production",
      value: movie.productionCompanies?.join(" · ") || unavailable,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-netflix-card shadow-2xl shadow-black/20"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${movie.title} details`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:border-netflix-red hover:text-netflix-red"
          aria-label="Close movie details"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        <div className="overflow-y-auto">
          <header
            className="relative flex min-h-64 items-end bg-cover bg-center px-6 pb-7 pt-24 sm:min-h-80 sm:px-9 sm:pb-9"
            style={
              movie.backdrop
                ? { backgroundImage: `url("${movie.backdrop}")` }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-card via-black/55 to-black/20" />
            <div className="relative z-10 max-w-3xl">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-netflix-red">
                {movie.genres.slice(0, 3).join(" · ") || "Movie details"}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {movie.title}
              </h2>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-netflix-lightgray sm:text-sm">
                <span>{movie.year}</span>
                <span aria-hidden="true" className="text-white/35">
                  /
                </span>
                <span>
                  <i className="fa-solid fa-star mr-1.5 text-netflix-red" />
                  {movie.rating} / 5
                </span>
                {movie.runtime && (
                  <>
                    <span aria-hidden="true" className="text-white/35">
                      /
                    </span>
                    <span>{movie.runtime}</span>
                  </>
                )}
              </p>
            </div>
          </header>

          <div className="space-y-9 px-5 py-6 sm:px-9 sm:py-8">
            {detailsError && (
              <p
                role="status"
                className="rounded-lg border border-black/10 bg-black/[0.03] px-4 py-3 text-xs leading-5 text-netflix-gray"
              >
                Some movie details could not be loaded: {detailsError}
              </p>
            )}

            <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-netflix-gray">
                  The story
                </p>
                <p className="max-w-3xl text-sm leading-7 text-netflix-lightgray">
                  {movie.overview}
                </p>
              </div>

              <aside className="space-y-5 rounded-xl border border-black/10 bg-netflix-page p-4 sm:p-5">
                <div>
                  <label
                    htmlFor="modalWatchlistStatus"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-netflix-gray"
                  >
                    Your watchlist
                  </label>
                  <select
                    id="modalWatchlistStatus"
                    value={currentStatus}
                    onChange={(event) =>
                      onUpdateStatus(movie.id, event.target.value)
                    }
                    className="field-control w-full rounded-lg px-3 py-2.5 text-xs focus:border-netflix-butter focus:outline-none"
                  >
                    <option value="none">Not in Watchlist</option>
                    <option value="want">Want to Watch</option>
                    <option value="watching">Currently Watching</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-netflix-gray">
                    Where to watch · US
                  </p>
                  {movie.providers.length ? (
                    <div className="flex flex-wrap gap-2">
                      {movie.providers.map((provider) => (
                        <span
                          key={provider}
                          className="rounded-full border border-black/10 px-2.5 py-1 text-[10px] text-netflix-lightgray"
                        >
                          {provider}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-netflix-gray">
                      {isLoading
                        ? "Loading providers…"
                        : "No providers listed."}
                    </p>
                  )}
                </div>
              </aside>
            </section>

            <section aria-labelledby="movieFactsHeading">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-netflix-butter">
                    Production notes
                  </p>
                  <h3
                    id="movieFactsHeading"
                    className="text-lg font-medium text-netflix-black"
                  >
                    The fine print
                  </h3>
                </div>
                <span className="text-[10px] uppercase tracking-[0.12em] text-netflix-gray">
                  TMDb data
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-black/10 bg-netflix-page px-4 sm:px-6">
                <table className="w-full border-collapse text-left">
                  <tbody>
                    {facts.map((fact) => (
                      <tr
                        key={fact.label}
                        className="border-b border-black/10 last:border-0"
                      >
                        <th
                          scope="row"
                          className="w-[36%] py-3.5 pr-4 text-[10px] font-medium uppercase tracking-[0.13em] text-netflix-gray sm:w-[28%] sm:text-[11px]"
                        >
                          {fact.label}
                        </th>
                        <td className="py-3.5 text-xs leading-5 text-netflix-lightgray sm:text-sm">
                          {fact.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="movieCastHeading">
              <div className="mb-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-netflix-butter">
                  The people
                </p>
                <h3
                  id="movieCastHeading"
                  className="text-lg font-medium text-netflix-black"
                >
                  Top billed cast
                </h3>
              </div>
              {movie.cast.length ? (
                <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                  {movie.cast.map((person, index) => (
                    <li
                      key={person.id || person.name}
                      className="min-w-0 overflow-hidden rounded-xl border border-black/10 bg-netflix-page"
                    >
                      <div className="relative">
                        <CastPortrait person={person} />
                        <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/60 px-2 py-1 font-mono text-[9px] text-white/85">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="truncate text-xs font-medium text-netflix-black sm:text-sm">
                          {person.name}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-netflix-gray sm:text-xs">
                          {person.character || "Cast"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="rounded-xl border border-black/10 bg-netflix-page px-4 py-5 text-xs text-netflix-gray">
                  {isLoading ? "Loading cast…" : "Cast information not listed."}
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
