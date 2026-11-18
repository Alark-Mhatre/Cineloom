import { failureResponse, jsonResponse, tmdb } from "./_shared/tmdb.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  try {
    return jsonResponse(200, await tmdb.getMovieSections());
  } catch (error) {
    return failureResponse(error, "Could not load TMDb movie sections:");
  }
}
