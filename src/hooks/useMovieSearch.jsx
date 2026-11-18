import { useEffect, useState } from "react";
import { searchMovies } from "../api/tmdb.jsx";

const DEBOUNCE_MS = 350;

export function useMovieSearch(query) {
  const [state, setState] = useState({
    query: "",
    status: "idle",
    results: [],
    error: "",
  });
  const [retryId, setRetryId] = useState(0);
  const normalizedQuery = query.trim();

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setState({
        query: normalizedQuery,
        status: "idle",
        results: [],
        error: "",
      });
      return undefined;
    }

    const controller = new AbortController();
    setState({
      query: normalizedQuery,
      status: "loading",
      results: [],
      error: "",
    });

    const timeoutId = setTimeout(() => {
      searchMovies(normalizedQuery, controller.signal)
        .then((results) => {
          setState({
            query: normalizedQuery,
            status: "success",
            results,
            error: "",
          });
        })
        .catch((requestError) => {
          if (requestError.name === "AbortError") return;
          setState({
            query: normalizedQuery,
            status: "error",
            results: [],
            error: requestError.message,
          });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [normalizedQuery, retryId]);

  if (normalizedQuery.length < 2) {
    return {
      results: [],
      isLoading: false,
      error: "",
      retry: () => setRetryId((current) => current + 1),
    };
  }

  if (state.query !== normalizedQuery) {
    return {
      results: [],
      isLoading: true,
      error: "",
      retry: () => setRetryId((current) => current + 1),
    };
  }

  return {
    results: state.results,
    isLoading: state.status === "loading",
    error: state.status === "error" ? state.error : "",
    retry: () => setRetryId((current) => current + 1),
  };
}
