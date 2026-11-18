import { useEffect, useState } from "react";
import { fetchMovieDetails } from "../api/tmdb.jsx";

export function useMovieDetails(movie) {
  const [state, setState] = useState({
    id: null,
    status: "idle",
    details: null,
    error: "",
  });

  useEffect(() => {
    if (!movie) {
      setState({ id: null, status: "idle", details: null, error: "" });
      return undefined;
    }

    const controller = new AbortController();
    setState({
      id: movie.id,
      status: "loading",
      details: null,
      error: "",
    });

    fetchMovieDetails(movie.id, controller.signal)
      .then((details) => {
        setState({ id: movie.id, status: "success", details, error: "" });
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        setState({
          id: movie.id,
          status: "error",
          details: null,
          error: requestError.message,
        });
      });

    return () => controller.abort();
  }, [movie?.id]);

  if (!movie) return state;
  if (state.id !== movie.id) {
    return { id: movie.id, status: "loading", details: null, error: "" };
  }
  return state;
}
