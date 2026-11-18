import dotenv from "dotenv";
import express from "express";
import { createTmdbService, getErrorMessage } from "./server/tmdb-service.mjs";

dotenv.config({ path: ".env.local" });

const app = express();
const port = Number(process.env.API_PORT || 3001);
const tmdb = createTmdbService();

app.get("/api/movies", async (_request, response) => {
  try {
    response.json(await tmdb.getMovieSections());
  } catch (error) {
    console.error("Could not load TMDb movie sections:", error);
    response.status(error.status || 502).json({
      error: getErrorMessage(error),
    });
  }
});

app.get("/api/search", async (request, response) => {
  const query = typeof request.query.q === "string" ? request.query.q.trim() : "";
  if (query.length < 2) {
    response.json([]);
    return;
  }
  if (query.length > 100) {
    response.status(400).json({ error: "Search query must be 100 characters or fewer." });
    return;
  }

  try {
    response.json(await tmdb.searchMovies(query));
  } catch (error) {
    console.error("Could not search TMDb movies:", error);
    response.status(error.status || 502).json({
      error: getErrorMessage(error),
    });
  }
});

app.get("/api/movies/:id", async (request, response) => {
  if (!/^\d+$/.test(request.params.id)) {
    response.status(400).json({ error: "Movie ID must be numeric." });
    return;
  }

  try {
    response.json(await tmdb.getMovieDetails(Number(request.params.id)));
  } catch (error) {
    console.error(`Could not load TMDb movie ${request.params.id}:`, error);
    response.status(error.status || 502).json({
      error: getErrorMessage(error),
    });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.info(`Cineloom TMDb API listening on http://127.0.0.1:${port}`);
});
