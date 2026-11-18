const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";
const TMDB_READ_ACCESS_TOKEN = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
let cachedGenres;

async function request(path, signal) {
  if (!TMDB_READ_ACCESS_TOKEN) {
    throw new Error(
      "VITE_TMDB_READ_ACCESS_TOKEN is missing. Add your TMDb Read Access Token to the site's environment variables.",
    );
  }

  const response = await fetch(`${TMDB_API_URL}${path}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
    },
    signal,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.status_message || `TMDb request failed with status ${response.status}.`,
    );
  }

  return data;
}

async function getGenres(signal) {
  if (cachedGenres) return cachedGenres;

  const { genres } = await request("/genre/movie/list?language=en-US", signal);
  cachedGenres = new Map(genres.map(({ id, name }) => [id, name]));
  return cachedGenres;
}

function normalizeMovie(movie, genreNames) {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date?.slice(0, 4) || "—",
    rating: Number((movie.vote_average / 2).toFixed(1)),
    genres: (movie.genre_ids || []).map((id) => genreNames.get(id)).filter(Boolean),
    overview: movie.overview || "No synopsis is available.",
    poster: movie.poster_path ? `${TMDB_IMAGE_URL}/w500${movie.poster_path}` : "",
    backdrop: movie.backdrop_path
      ? `${TMDB_IMAGE_URL}/w1280${movie.backdrop_path}`
      : "",
    runtime: null,
    director: "",
    cast: [],
    providers: [],
  };
}

function uniqueSection(results, title, claimedIds, genreNames) {
  const movies = [];
  for (const result of results) {
    if (claimedIds.has(result.id)) continue;
    claimedIds.add(result.id);
    movies.push(normalizeMovie(result, genreNames));
    if (movies.length === 12) break;
  }
  return { id: title.toLowerCase().replaceAll(" ", "-"), title, movies };
}

export async function fetchMovieSections(signal) {
  const [trending, popular, topRated, genreNames] = await Promise.all([
    request("/trending/movie/day?language=en-US&page=1", signal),
    request("/movie/popular?language=en-US&page=1", signal),
    request("/movie/top_rated?language=en-US&page=1", signal),
    getGenres(signal),
  ]);
  const claimedIds = new Set();
  return [
    uniqueSection(trending.results, "Trending today", claimedIds, genreNames),
    uniqueSection(popular.results, "Popular", claimedIds, genreNames),
    uniqueSection(topRated.results, "Top rated", claimedIds, genreNames),
  ];
}

export async function searchMovies(query, signal) {
  const [response, genreNames] = await Promise.all([
    request(
      `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
      signal,
    ),
    getGenres(signal),
  ]);
  return response.results
    .slice(0, 20)
    .map((movie) => normalizeMovie(movie, genreNames));
}

function normalizeMovieDetails(details) {
  const providerResults = details["watch/providers"]?.results?.US;
  const providers = [
    ...(providerResults?.flatrate || []),
    ...(providerResults?.rent || []),
    ...(providerResults?.buy || []),
  ]
    .map((provider) => provider.provider_name)
    .filter((name, index, list) => list.indexOf(name) === index)
    .slice(0, 5);

  return {
    id: details.id,
    title: details.title,
    year: details.release_date?.slice(0, 4) || "—",
    releaseDate: details.release_date || "",
    rating: Number((details.vote_average / 2).toFixed(1)),
    tmdbRating: details.vote_average,
    voteCount: details.vote_count,
    genres: details.genres.map((genre) => genre.name),
    overview: details.overview || "No synopsis is available.",
    poster: details.poster_path ? `${TMDB_IMAGE_URL}/w500${details.poster_path}` : "",
    backdrop: details.backdrop_path
      ? `${TMDB_IMAGE_URL}/w1280${details.backdrop_path}`
      : "",
    runtime: details.runtime
      ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
      : null,
    budget: details.budget || 0,
    revenue: details.revenue || 0,
    status: details.status || "",
    originalLanguage: details.original_language || "",
    productionCompanies: (details.production_companies || [])
      .slice(0, 4)
      .map((company) => company.name),
    director:
      details.credits?.crew?.find((person) => person.job === "Director")?.name ||
      "Not listed",
    cast: (details.credits?.cast || [])
      .slice(0, 5)
      .map((person) => ({
        id: person.id,
        name: person.name,
        character: person.character || "",
        profile: person.profile_path
          ? `${TMDB_IMAGE_URL}/w185${person.profile_path}`
          : "",
      })),
    providers,
  };
}

export async function fetchMovieDetails(movieId, signal) {
  const details = await request(
    `/movie/${movieId}?language=en-US&append_to_response=credits,watch%2Fproviders`,
    signal,
  );
  return normalizeMovieDetails(details);
}
