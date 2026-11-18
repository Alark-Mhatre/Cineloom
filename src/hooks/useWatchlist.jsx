import { useEffect, useMemo, useRef, useState } from "react";
import { fetchMovieDetails } from "../api/tmdb.jsx";

const STORAGE_KEY = "cineloom_watchlist";
const VALID_STATUSES = new Set(["want", "watching", "completed"]);

function normalizeStoredMovie(movie, id) {
  if (
    !movie ||
    typeof movie !== "object" ||
    Array.isArray(movie) ||
    String(movie.id) !== id ||
    typeof movie.title !== "string"
  ) {
    return null;
  }

  return {
    ...movie,
    id: Number(id),
    year: typeof movie.year === "string" ? movie.year : "—",
    rating: Number.isFinite(movie.rating) ? movie.rating : 0,
    genres: Array.isArray(movie.genres)
      ? movie.genres.filter((genre) => typeof genre === "string")
      : [],
    overview:
      typeof movie.overview === "string" ? movie.overview : "No synopsis is available.",
    poster: typeof movie.poster === "string" ? movie.poster : "",
    backdrop: typeof movie.backdrop === "string" ? movie.backdrop : "",
    runtime: typeof movie.runtime === "string" ? movie.runtime : null,
    director: typeof movie.director === "string" ? movie.director : "",
    productionCompanies: Array.isArray(movie.productionCompanies)
      ? movie.productionCompanies.filter((company) => typeof company === "string")
      : [],
    cast: Array.isArray(movie.cast)
      ? movie.cast.filter(
          (person) => person && typeof person.name === "string",
        )
      : [],
    providers: Array.isArray(movie.providers)
      ? movie.providers.filter((provider) => typeof provider === "string")
      : [],
  };
}

function readWatchlist() {
  const savedWatchlist = localStorage.getItem(STORAGE_KEY);
  if (!savedWatchlist) return { entries: {}, warning: "" };

  try {
    const parsedWatchlist = JSON.parse(savedWatchlist);
    if (
      !parsedWatchlist ||
      typeof parsedWatchlist !== "object" ||
      Array.isArray(parsedWatchlist)
    ) {
      throw new Error("Saved watchlist must be an object.");
    }

    const entries = {};
    let discardedEntries = 0;
    for (const [id, entry] of Object.entries(parsedWatchlist)) {
      if (!/^\d+$/.test(id) || !entry || !VALID_STATUSES.has(entry.status)) {
        discardedEntries += 1;
        continue;
      }

      const movie = normalizeStoredMovie(entry.movie, id);
      entries[id] = {
        status: entry.status,
        addedDate: typeof entry.addedDate === "string" ? entry.addedDate : "",
        ...(movie ? { movie } : {}),
      };
    }

    return {
      entries,
      warning: discardedEntries
        ? "Some invalid saved watchlist items were removed."
        : "",
    };
  } catch (error) {
    console.error("Could not read the saved watchlist; resetting it:", error);
    localStorage.removeItem(STORAGE_KEY);
    return {
      entries: {},
      warning: "Saved watchlist data was invalid and has been reset.",
    };
  }
}

function fallbackMovie(id) {
  return {
    id: Number(id),
    title: `Saved movie ${id}`,
    year: "—",
    rating: 0,
    genres: [],
    overview: "Movie information is being restored.",
    poster: "",
    backdrop: "",
    runtime: null,
    director: "",
    cast: [],
    providers: [],
  };
}

export function useWatchlist(movies) {
  const [initialData] = useState(readWatchlist);
  const [watchlist, setWatchlist] = useState(initialData.entries);
  const [recoveryError, setRecoveryError] = useState("");
  const [retryId, setRetryId] = useState(0);
  const attemptedIds = useRef(new Set());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    if (!movies.length) return;

    setWatchlist((current) => {
      let changed = false;
      const updated = { ...current };
      for (const [id, entry] of Object.entries(current)) {
        if (entry.movie) continue;
        const movie = movies.find((item) => String(item.id) === id);
        if (!movie) continue;
        updated[id] = { ...entry, movie };
        changed = true;
      }
      return changed ? updated : current;
    });
  }, [movies]);

  useEffect(() => {
    if (!movies.length) return undefined;
    const missingEntries = Object.entries(watchlist).filter(
      ([id, entry]) =>
        !entry.movie &&
        !movies.some((movie) => String(movie.id) === id) &&
        !attemptedIds.current.has(id),
    );
    if (!missingEntries.length) return undefined;

    const controller = new AbortController();
    for (const [id] of missingEntries) attemptedIds.current.add(id);

    let finished = false;
    Promise.all(
      missingEntries.map(async ([id]) => {
        try {
          return { id, movie: await fetchMovieDetails(id, controller.signal) };
        } catch (error) {
          if (error.name === "AbortError") throw error;
          return { id, error };
        }
      }),
    )
      .then((results) => {
        if (controller.signal.aborted) return;
        finished = true;
        const restored = results.filter((result) => result.movie);
        const failedCount = results.length - restored.length;

        if (restored.length) {
          const restoredMovies = new Map(
            restored.map(({ id, movie }) => [id, movie]),
          );
          setWatchlist((current) => {
            const updated = { ...current };
            for (const [id, movie] of restoredMovies) {
              if (updated[id] && !updated[id].movie) {
                updated[id] = { ...updated[id], movie };
              }
            }
            return updated;
          });
        }

        setRecoveryError(
          failedCount
            ? `Could not restore ${failedCount} saved movie${failedCount === 1 ? "" : "s"}. Check your connection and try again.`
            : "",
        );
      })
      .catch((error) => {
        finished = true;
        if (error.name !== "AbortError") {
          setRecoveryError("Could not restore saved movies. Try again.");
        }
      });
    return () => {
      controller.abort();
      if (!finished) {
        for (const [id] of missingEntries) attemptedIds.current.delete(id);
      }
    };
  }, [movies, retryId, watchlist]);

  const savedMovies = useMemo(
    () =>
      Object.entries(watchlist).map(([id, entry]) => {
        const movie =
          entry.movie ||
          movies.find((item) => String(item.id) === id) ||
          fallbackMovie(id);
        return { ...movie, userStatus: entry.status };
      }),
    [movies, watchlist],
  );

  const stats = useMemo(
    () => ({
      total: savedMovies.length,
      completed: savedMovies.filter(
        (movie) => movie.userStatus === "completed",
      ).length,
      hours: `${(savedMovies.length * 2.4).toFixed(0)}h`,
    }),
    [savedMovies],
  );

  function addMovie(movie) {
    setWatchlist((current) => {
      if (current[movie.id]) return current;
      return {
        ...current,
        [movie.id]: {
          status: "want",
          addedDate: new Date().toISOString().split("T")[0],
          movie,
        },
      };
    });
  }

  function removeMovie(movieId) {
    setWatchlist((current) => {
      if (!current[movieId]) return current;
      const updated = { ...current };
      delete updated[movieId];
      return updated;
    });
  }

  function updateMovieStatus(movie, status) {
    setWatchlist((current) => {
      if (status === "none") {
        if (!current[movie.id]) return current;
        const updated = { ...current };
        delete updated[movie.id];
        return updated;
      }

      if (current[movie.id]?.status === status) return current;
      return {
        ...current,
        [movie.id]: {
          status,
          addedDate:
            current[movie.id]?.addedDate ||
            new Date().toISOString().split("T")[0],
          movie,
        },
      };
    });
  }

  function retryRecovery() {
    for (const [id, entry] of Object.entries(watchlist)) {
      if (!entry.movie && !movies.some((movie) => String(movie.id) === id)) {
        attemptedIds.current.delete(id);
      }
    }
    setRecoveryError("");
    setRetryId((current) => current + 1);
  }

  return {
    watchlist,
    savedMovies,
    stats,
    storageWarning: initialData.warning,
    recoveryError,
    retryRecovery,
    addMovie,
    removeMovie,
    updateMovieStatus,
  };
}
