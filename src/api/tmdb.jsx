async function request(path, signal) {
  const response = await fetch(path, { signal });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export function fetchMovieSections(signal) {
  return request("/api/movies", signal);
}

export function searchMovies(query, signal) {
  return request(`/api/search?q=${encodeURIComponent(query)}`, signal);
}

export function fetchMovieDetails(movieId, signal) {
  return request(`/api/movies/${movieId}`, signal);
}
