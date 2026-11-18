import { failureResponse, jsonResponse, tmdb } from "./_shared/tmdb.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const movieId = event.queryStringParameters?.id || "";
  if (!/^\d+$/.test(movieId)) {
    return jsonResponse(400, { error: "Movie ID must be numeric." });
  }

  try {
    return jsonResponse(200, await tmdb.getMovieDetails(Number(movieId)));
  } catch (error) {
    return failureResponse(error, `Could not load TMDb movie ${movieId}:`);
  }
}
