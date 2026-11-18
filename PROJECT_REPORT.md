# Cineloom — Movie Discovery and Community Tracker

## Project overview

Cineloom is a responsive movie-discovery and tracking web application. It brings
movie discovery, searchable film information, a personal watchlist, and
viewer-created discussions into one interface. Movie data and artwork are
provided by The Movie Database (TMDb).

## Problem definition

Movie information is spread across discovery, search, streaming availability,
and discussion services. Viewers may also lose track of films they want to see
or have already watched.

Cineloom addresses this by providing one place to browse films, view useful
details, keep a categorized watchlist, and share movie-related opinions. The
interface uses familiar poster cards and horizontally scrolling rows so users
can scan a large set of films quickly.

## Project objectives

- Present current, popular, and highly rated films in an easy-to-browse layout.
- Let users search TMDb for movies by title.
- Show extended film information and US streaming-provider listings.
- Provide a persistent, categorized personal watchlist.
- Let viewers create and browse reviews, theories, and discussions.
- Keep the interface responsive and provide feedback for loading, errors, and
  user actions.

## Features

### Discover

- Highlights the first movie in the “Trending today” collection.
- Shows horizontally scrolling “Trending today,” “Popular,” and “Top rated”
  poster-card rows.
- Displays a movie’s poster, title, year, genre, and rating on each card.
- Provides controls to open movie details or add a movie to the watchlist.

### Search

- Searches movie titles through TMDb.
- Waits until at least two characters have been entered and debounces requests
  by 350 ms.
- Displays results as a responsive poster-card grid.
- Supports loading, empty-result, retry, and error states.

### Movie details

Selecting a movie opens a dialog with its synopsis, release information,
runtime, rating, budget, box office, language, production companies, director,
cast, and available US streaming providers when supplied by TMDb.

The dialog also lets a viewer change the movie’s watchlist status.

### Watchlist

- Supports “Want to Watch,” “Currently Watching,” and “Watched” statuses.
- Allows saved movies to be filtered by status or viewed together.
- Shows saved and completed counts and an estimated watch-time total.
- Saves watchlist entries in browser `localStorage`, so they persist between
  visits in the same browser.

### Community

- Supports posts categorized as reviews, theories, or discussions.
- Allows a viewer to choose a movie, enter a username and post, and optionally
  select a rating.
- Supports filtering posts by category, toggling upvotes, and copying a
  shareable post link.
- Saves posts and the selected filter in browser `localStorage`.

### Responsive interface and feedback

- Provides desktop navigation and a mobile navigation bar.
- Uses movie-card grids and carousels, with responsive layouts for smaller
  screens.
- Shows toast notifications after actions such as saving a movie or publishing
  a post.
- Includes retry/error views and a React error boundary.

## Implementation

### Technology

- **React** builds the user interface from reusable components.
- **Vite** serves the frontend during development and creates production builds.
- **Tailwind CSS** supplies utility styles; [styles.css](./src/styles.css)
  contains shared styling and accessibility-related focus and motion rules.
- **TMDb API** is called directly from the browser for movie lists, search
  results, metadata, images, cast, and US watch-provider data.
- **Netlify** builds and serves the static Vite output; it does not run
  application functions or an API proxy.
- **Browser `localStorage`** stores the watchlist, community posts, and selected
  UI filters.

### Request and rendering flow

1. [main.jsx](./src/main.jsx) mounts the React application inside an error
   boundary.
2. [App.jsx](./src/App.jsx) coordinates the current tab, search, selected movie,
   watchlist actions, community actions, and dialogs.
3. [useMovies.jsx](./src/hooks/useMovies.jsx) requests the movie collections
   through the browser API helper and exposes loading and retry state.
4. [tmdb.jsx](./src/api/tmdb.jsx) calls TMDb endpoints directly from the
   browser and adapts the responses for the React components.
5. React components render the collections and respond to user actions.

Set `VITE_TMDB_READ_ACCESS_TOKEN` in `.env.local` for local development and in
the Netlify site's build environment for deployment. Vite embeds this value in
the public browser bundle, so it is visible to site visitors. This is an
intentional tradeoff of direct browser requests; no server or API proxy is
included.

### API endpoints

| Endpoint | Purpose |
| --- | --- |
| TMDb `/trending/movie/day` | Fetches the trending movie section. |
| TMDb `/movie/popular` and `/movie/top_rated` | Fetches the other discovery sections. |
| TMDb `/search/movie` | Searches TMDb for movies matching a query. |
| TMDb `/movie/{id}` | Fetches extended details, credits, and watch providers. |

Search results are limited to 20 items. Movie data is fetched from the visitor's
browser; no server-side cache or API endpoint is used.

### State and persistence

- [useWatchlist.jsx](./src/hooks/useWatchlist.jsx) reads and writes
  `cineloom_watchlist` in `localStorage`.
- [useCommunityPosts.jsx](./src/hooks/useCommunityPosts.jsx) persists community
  posts and their active category filter.
- [App.jsx](./src/App.jsx) persists the active tab.
- [WatchlistView.jsx](./src/components/WatchlistView.jsx) persists the
  watchlist’s active filter.

### Error handling

Network and API errors from TMDb are presented in the discovery or search
views. Requests use `AbortController` so obsolete requests can be cancelled
when components update or unmount. The React error-boundary component also
catches rendering and unhandled application errors.

## Source code directory

The complete source code is maintained in the project files below; it is not
duplicated in this report.

```text
.
├── index.html
├── netlify.toml
├── vite.config.jsx
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── api/
    │   └── tmdb.jsx
    ├── data/
    │   └── movies.jsx
    ├── hooks/
    │   ├── useCommunityPosts.jsx
    │   ├── useMovieDetails.jsx
    │   ├── useMovies.jsx
    │   ├── useMovieSearch.jsx
    │   ├── useToast.jsx
    │   └── useWatchlist.jsx
    └── components/
        ├── CommunityPost.jsx
        ├── CommunityView.jsx
        ├── CreatePostModal.jsx
        ├── DiscoverView.jsx
        ├── ErrorBoundary.jsx
        ├── ErrorView.jsx
        ├── Footer.jsx
        ├── Header.jsx
        ├── MobileNav.jsx
        ├── MovieCard.jsx
        ├── MovieCarousel.jsx
        ├── MovieModal.jsx
        ├── MovieSearchView.jsx
        ├── ToastNotification.jsx
        └── WatchlistView.jsx
```

### File responsibilities

| File or folder | Responsibility |
| --- | --- |
| [App.jsx](./src/App.jsx) | Application state, tab routing, and coordination of views and actions. |
| [main.jsx](./src/main.jsx) | React entry point and error-boundary setup. |
| [styles.css](./src/styles.css) | Global palette, typography, focus styles, motion preferences, and card effects. |
| [netlify.toml](./netlify.toml) | Static Vite build and publish settings; no functions or API rewrites. |
| [vite.config.jsx](./vite.config.jsx) | Vite and React plugin configuration. |
| [api/tmdb.jsx](./src/api/tmdb.jsx) | Direct browser requests to TMDb and response normalization. |
| [data/movies.jsx](./src/data/movies.jsx) | Initial community-post data. |
| [hooks/](./src/hooks/) | Data fetching, debounced search, watchlist/community persistence, and toast state. |
| [components/DiscoverView.jsx](./src/components/DiscoverView.jsx) | Discovery states, featured movie, and movie-section rendering. |
| [components/HeroSection.jsx](./src/components/HeroSection.jsx) | Featured movie hero banner and quick actions. |
| [components/MovieCarousel.jsx](./src/components/MovieCarousel.jsx) | Horizontally scrollable movie sections. |
| [components/MovieCard.jsx](./src/components/MovieCard.jsx) | Reusable poster card for browsing and search results. |
| [components/MovieSearchView.jsx](./src/components/MovieSearchView.jsx) | Search results, loading, error, and empty states. |
| [components/MovieModal.jsx](./src/components/MovieModal.jsx) | Movie details dialog and watchlist status selection. |
| [components/WatchlistView.jsx](./src/components/WatchlistView.jsx) | Saved-film filters, status labels, statistics, and removal actions. |
| [components/CommunityView.jsx](./src/components/CommunityView.jsx) | Community feed and post-category controls. |
| [components/CommunityPost.jsx](./src/components/CommunityPost.jsx) | Individual post display, upvotes, and sharing action. |
| [components/CreatePostModal.jsx](./src/components/CreatePostModal.jsx) | Form for creating a movie-related post. |
| [components/Header.jsx](./src/components/Header.jsx) | Desktop navigation, search input, and post/watchlist actions. |
| [components/MobileNav.jsx](./src/components/MobileNav.jsx) | Compact navigation for mobile screens. |
| [components/Footer.jsx](./src/components/Footer.jsx) | Footer navigation and TMDb attribution. |
| [components/ToastNotification.jsx](./src/components/ToastNotification.jsx) | Short status messages for user actions. |
| [components/ErrorView.jsx](./src/components/ErrorView.jsx) | Full-page application error and retry view. |
| [components/ErrorBoundary.jsx](./src/components/ErrorBoundary.jsx) | Catches React render errors and unhandled browser errors. |

## Running the project

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_TMDB_READ_ACCESS_TOKEN` in `.env.local`.
3. Install dependencies with `npm install`.
4. Start the frontend with `npm run dev`.
5. Open the URL printed by Vite.

Run `npm run build` to create a production build.

## Limitations and future improvements

- TMDb requests require internet access and a valid read-access token.
- The direct browser integration exposes the configured token in the built
  JavaScript; use token restrictions and rotation as appropriate.
- The watchlist and community posts are stored per browser and are not synced
  between users or devices; there is no account or server-side database.
- Community comment counts are displayed, but a comment-writing workflow is
  not implemented.
- The watchlist’s estimated hours use a fixed estimate per saved film.
- The displayed streaming providers are US availability data from TMDb and may
  change over time.

## Data attribution

Movie data and images are provided by TMDb. Cineloom uses the TMDB API but is
not endorsed or certified by TMDb.
