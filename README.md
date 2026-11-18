# Cineloom

Cineloom uses TMDb for its Trending Today, Popular, and Top Rated movie lists.
The API server keeps the TMDb Read Access Token out of the browser bundle.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Create a TMDb account and generate a Read Access Token in the API settings.
3. Set `TMDB_READ_ACCESS_TOKEN` in `.env.local` to that token.
4. Run `npm install`, then `npm run dev`.

The Vite app runs at `http://localhost:5173`; its `/api` requests are proxied to
the local Express API server. The shared TMDb service caches movie sections for
five minutes and movie details for one hour per server instance.

## Deploy to Netlify

The site is configured with `netlify.toml` to build the Vite app, publish
`dist`, and serve the movie API through Netlify Functions. It uses locally
compiled Tailwind CSS and does not rely on the Tailwind CDN for production
styles. The TMDb token must remain server-side:

1. Push this project to a Git provider supported by Netlify.
2. In Netlify, choose **Add new site → Import an existing project** and select
   the repository. Netlify reads the build and functions settings from
   `netlify.toml`.
3. In the site's **Environment variables** settings, add
   `TMDB_READ_ACCESS_TOKEN` with your TMDb Read Access Token.
4. Trigger a deploy and check the deployment log. The site uses the same
   `/api` routes locally and on Netlify.

Do not add the TMDb token to frontend variables such as `VITE_*` or commit it
to the repository. The Netlify functions need to be enabled for production
movie data, search, and details requests to work.

Movie data and images are provided by TMDb. This product uses the TMDB API but
is not endorsed or certified by TMDB.
