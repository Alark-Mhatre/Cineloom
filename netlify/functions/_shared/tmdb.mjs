import { createTmdbService, getErrorMessage } from "../../../server/tmdb-service.mjs";

export const tmdb = createTmdbService();
export { getErrorMessage };

export function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(data),
  };
}

export function failureResponse(error, message) {
  console.error(message, error);
  return jsonResponse(error.status || 502, {
    error: getErrorMessage(error),
  });
}
