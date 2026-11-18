import { failureResponse, jsonResponse, tmdb } from "./_shared/tmdb.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const query =
    typeof event.queryStringParameters?.q === "string"
      ? event.queryStringParameters.q.trim()
      : "";
  if (query.length < 2) {
    return jsonResponse(200, []);
  }
  if (query.length > 100) {
    return jsonResponse(400, {
      error: "Search query must be 100 characters or fewer.",
    });
  }

  try {
    return jsonResponse(200, await tmdb.searchMovies(query));
  } catch (error) {
    return failureResponse(error, "Could not search TMDb movies:");
  }
}
