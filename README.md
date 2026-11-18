# Cineloom

Cineloom uses TMDb for its Trending Today, Popular, and Top Rated movie lists.
The API server keeps the TMDb Read Access Token out of the browser bundle.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Create a TMDb account and generate a Read Access Token in the API settings.
3. Set `TMDB_READ_ACCESS_TOKEN` in `.env.local` to that token.
4. Run `npm install`, then `npm run dev`.

The Vite app runs at `http://localhost:5173`; its `/api` requests are proxied to
the local API server. Movie sections are cached for five minutes and movie
details for one hour.

Movie data and images are provided by TMDb. This product uses the TMDB API but
is not endorsed or certified by TMDB.
