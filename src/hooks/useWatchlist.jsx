import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cineloom_watchlist";

function readWatchlist() {
  const savedWatchlist = localStorage.getItem(STORAGE_KEY);
  if (!savedWatchlist) return {};

  const parsedWatchlist = JSON.parse(savedWatchlist);
  return Object.fromEntries(
    Object.entries(parsedWatchlist).filter(([id]) => /^\d+$/.test(id)),
  );
}

export function useWatchlist(movies) {
  const [watchlist, setWatchlist] = useState(readWatchlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const savedMovies = useMemo(
    () =>
      Object.entries(watchlist)
        .map(([id, entry]) => {
          const movie = movies.find((item) => String(item.id) === id);
          return movie ? { ...movie, userStatus: entry.status } : null;
        })
        .filter(Boolean),
    [movies, watchlist],
  );

  const stats = useMemo(() => {
    const savedEntries = savedMovies;
    return {
      total: savedEntries.length,
      completed: savedEntries.filter(
        (movie) => movie.userStatus === "completed",
      )
        .length,
      hours: `${(savedEntries.length * 2.4).toFixed(0)}h`,
    };
  }, [savedMovies]);

  function addMovie(movieId) {
    setWatchlist((current) => {
      if (current[movieId]) return current;
      return {
        ...current,
        [movieId]: {
          status: "want",
          addedDate: new Date().toISOString().split("T")[0],
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

  function updateMovieStatus(movieId, status) {
    setWatchlist((current) => {
      if (status === "none") {
        if (!current[movieId]) return current;
        const updated = { ...current };
        delete updated[movieId];
        return updated;
      }

      if (current[movieId]?.status === status) return current;
      return {
        ...current,
        [movieId]: {
          status,
          addedDate:
            current[movieId]?.addedDate ||
            new Date().toISOString().split("T")[0],
        },
      };
    });
  }

  return { watchlist, savedMovies, stats, addMovie, removeMovie, updateMovieStatus };
}
