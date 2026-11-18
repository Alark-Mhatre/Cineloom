import { useEffect, useMemo, useState } from "react";
import { fetchMovieSections } from "../api/tmdb.jsx";

export function useMovies() {
  const [sections, setSections] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError("");

    fetchMovieSections(controller.signal)
      .then((movieSections) => {
        setSections(movieSections);
        setStatus("success");
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        setError(requestError.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadId]);

  const movies = useMemo(
    () => sections.flatMap((section) => section.movies),
    [sections],
  );

  return {
    sections,
    movies,
    isLoading: status === "loading",
    error: status === "error" ? error : "",
    retry: () => setReloadId((current) => current + 1),
  };
}
