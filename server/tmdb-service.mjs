const tmdbBaseUrl = "https://api.themoviedb.org/3";
const imageBaseUrl = "https://image.tmdb.org/t/p";
const transientNetworkErrors = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "UND_ERR_CONNECT_TIMEOUT",
]);

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  if (transientNetworkErrors.has(error?.cause?.code)) {
    return "Could not connect to TMDb. Check your internet connection and try again.";
  }
  return error instanceof Error
    ? error.message
    : "Could not load movie data from TMDb.";
}

export function createTmdbService() {
  const sectionCache = { expiresAt: 0, value: null };
  const genreCache = { expiresAt: 0, value: null };
  const detailCache = new Map();

  async function tmdbRequest(path) {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token) {
      throw new ApiError(
        503,
        "TMDB_READ_ACCESS_TOKEN is missing. Set it in your local .env.local file or Netlify environment variables.",
      );
    }

    const deadline = Date.now() + 7000;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(`${tmdbBaseUrl}${path}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new ApiError(
            response.status === 401 ? 503 : 502,
            data.status_message || `TMDb request failed (${response.status}).`,
          );
        }

        return data;
      } catch (error) {
        const isTimeout = error?.name === "TimeoutError";
        const isRetryable =
          isTimeout || transientNetworkErrors.has(error?.cause?.code);
        if (!isRetryable || attempt === 2 || Date.now() >= deadline) {
          if (isTimeout) {
            throw new ApiError(504, "TMDb request timed out. Please try again.");
          }
          throw error;
        }
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.min(250 * (attempt + 1), deadline - Date.now()),
          ),
        );
      }
    }

    throw new ApiError(504, "TMDb request timed out. Please try again.");
  }

  function normalizeMovie(movie, genreNames) {
    return {
      id: movie.id,
      title: movie.title,
      year: movie.release_date?.slice(0, 4) || "—",
      rating: Number((movie.vote_average / 2).toFixed(1)),
      genres: (movie.genre_ids || []).map((id) => genreNames.get(id)).filter(Boolean),
      overview: movie.overview || "No synopsis is available.",
      poster: movie.poster_path ? `${imageBaseUrl}/w500${movie.poster_path}` : "",
      backdrop: movie.backdrop_path
        ? `${imageBaseUrl}/w1280${movie.backdrop_path}`
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

  async function loadGenreNames() {
    if (genreCache.value && Date.now() < genreCache.expiresAt) {
      return genreCache.value;
    }

    const response = await tmdbRequest("/genre/movie/list?language=en-US");
    const genres = new Map(
      response.genres.map((genre) => [genre.id, genre.name]),
    );
    genreCache.value = genres;
    genreCache.expiresAt = Date.now() + 60 * 60 * 1000;
    return genres;
  }

  async function getMovieSections() {
    if (sectionCache.value && Date.now() < sectionCache.expiresAt) {
      return sectionCache.value;
    }

    const [trending, popular, topRated, genreNames] = await Promise.all([
      tmdbRequest("/trending/movie/day?language=en-US&page=1"),
      tmdbRequest("/movie/popular?language=en-US&page=1"),
      tmdbRequest("/movie/top_rated?language=en-US&page=1"),
      loadGenreNames(),
    ]);
    const claimedIds = new Set();
    const sections = [
      uniqueSection(trending.results, "Trending today", claimedIds, genreNames),
      uniqueSection(popular.results, "Popular", claimedIds, genreNames),
      uniqueSection(topRated.results, "Top rated", claimedIds, genreNames),
    ];

    sectionCache.value = sections;
    sectionCache.expiresAt = Date.now() + 5 * 60 * 1000;
    return sections;
  }

  async function searchMovies(query) {
    const [response, genreNames] = await Promise.all([
      tmdbRequest(
        `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
      ),
      loadGenreNames(),
    ]);
    return response.results.slice(0, 20).map((movie) =>
      normalizeMovie(movie, genreNames),
    );
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
      poster: details.poster_path ? `${imageBaseUrl}/w500${details.poster_path}` : "",
      backdrop: details.backdrop_path
        ? `${imageBaseUrl}/w1280${details.backdrop_path}`
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
            ? `${imageBaseUrl}/w185${person.profile_path}`
            : "",
        })),
      providers,
    };
  }

  async function getMovieDetails(movieId) {
    const cached = detailCache.get(movieId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    const details = await tmdbRequest(
      `/movie/${movieId}?language=en-US&append_to_response=credits,watch%2Fproviders`,
    );
    const movie = normalizeMovieDetails(details);
    detailCache.set(movieId, {
      value: movie,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
    return movie;
  }

  return { getMovieSections, searchMovies, getMovieDetails };
}
