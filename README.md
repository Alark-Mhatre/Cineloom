# Cineloom

Cineloom is a React movie tracker that fetches movie data directly from the
TMDb API in the browser. It has no Express server, Netlify Functions, or
application-owned API proxy.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_TMDB_READ_ACCESS_TOKEN` to your TMDb Read Access Token.
3. Install dependencies with `npm install`.
4. Run `npm run dev` and open the URL printed by Vite.

If you previously configured `TMDB_READ_ACCESS_TOKEN`, rename it to
`VITE_TMDB_READ_ACCESS_TOKEN` in `.env.local` and in Netlify's environment
variables.

## Deploy to Netlify

Netlify only builds and serves the static Vite site. Set
`VITE_TMDB_READ_ACCESS_TOKEN` in the Netlify site's environment variables, then
deploy the project. The Netlify build configuration contains no functions or
API rewrites.

**Important:** Vite embeds `VITE_*` variables in the browser bundle. With this
direct-browser setup, visitors can inspect and reuse the TMDb token. This is
not a secret-safe configuration. Restrict or rotate the token in TMDb settings
as needed; keeping it private would require a server-side proxy, which this
project intentionally does not use.

Movie data and images are provided by TMDb. Cineloom uses the TMDB API but is
not endorsed or certified by TMDB.
