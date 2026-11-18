# Cineloom Source File Guide

This guide explains the files selected for review and how they fit together.
The source files themselves remain the complete implementation; this document
describes their responsibilities rather than copying their code.

## Application entry and coordinator

### [`src/main.jsx`](./src/main.jsx)

This is the browser entry point for the React application.

1. It imports the global stylesheet and the root `App` component.
2. It creates a React root in the HTML element whose ID is `root`.
3. It renders `App` inside React `StrictMode` and the `ErrorBoundary`.

The error boundary gives the app a place to handle rendering failures rather
than leaving the page blank.

### [`src/App.jsx`](./src/App.jsx)

`App` is the main coordinator. It does not implement every screen itself;
instead it owns shared state, calls the hooks, and passes data and callbacks to
the relevant view components.

#### State and hooks

- **Active tab:** Starts from the `cineloom_active_tab` browser-storage value
  when it is valid; otherwise it starts on Discover. Changes are saved back to
  `localStorage`.
- **Path:** Tracks the browser pathname for the app's error screen.
- **Search query:** Passed to `useMovieSearch` and the header.
- **Selected movie:** Drives `useMovieDetails` and the movie-details dialog.
- **Create-post dialog:** Controls whether the community post form is shown.
- **Movie data:** `useMovies` returns the sections, flattened movie list,
  loading/error state, and retry action.
- **Watchlist:** `useWatchlist` returns saved entries, derived movies,
  statistics, and add/remove/status actions.
- **Community:** `useCommunityPosts` returns posts, the active filter, and
  post/upvote actions.
- **Notifications:** `useToast` provides the current notification and a
  function to show one.

#### Main event handlers

- `switchTab` changes the active screen and scrolls the page to the top.
- `addToWatchlist`, `removeFromWatchlist`, and `updateWatchlistStatus` perform
  watchlist actions and give feedback through a toast.
- `handleSearch` updates the query and returns the user to Discover when a
  non-empty query is entered.
- `publishPost` verifies the selected movie, adds the movie title and initial
  post metadata, closes the form, and shows confirmation.
- `sharePost` attempts to copy a post URL to the clipboard and reports
  success or failure.

The render section selects Discover, Community, or Watchlist based on the
active tab. It also renders shared navigation, the footer, toast, movie dialog,
and post-creation dialog. This project uses local state and `history` handling
for its error route rather than a routing library.

## Movie data hooks

### [`src/hooks/useMovies.jsx`](./src/hooks/useMovies.jsx)

`useMovies` loads the movie sections for the Discover screen.

- Starts in a loading state.
- Calls `fetchMovieSections` from the TMDb API helper.
- Aborts the request if the component using the hook unmounts or retries.
- Stores returned sections and derives a single `movies` array by flattening
  the sections.
- Returns `isLoading`, `error`, and `retry` alongside the data.

The `retry` function increments an internal ID. That change reruns the effect
and requests the sections again.

### [`src/hooks/useMovieDetails.jsx`](./src/hooks/useMovieDetails.jsx)

`useMovieDetails(movie)` loads extended details for the currently selected
movie.

- With no selected movie, it returns an idle state.
- When a movie is selected, it records that movie's ID and enters a loading
  state.
- Calls `fetchMovieDetails` and stores either the details or an error message.
- Aborts the request when the selection changes or the hook's owner unmounts.
- Checks that its stored ID matches the selected movie ID before returning
  details. This prevents details from a previous selection appearing for a
  newly selected movie.

The returned object contains `id`, `status`, `details`, and `error`.

### [`src/hooks/useMovieSearch.jsx`](./src/hooks/useMovieSearch.jsx)

`useMovieSearch(query)` performs live movie search while avoiding unnecessary
requests.

- Trims whitespace from the query.
- Does not request results until the query contains at least two characters.
- Waits 350 ms after typing before calling `searchMovies`.
- Cancels the pending timer and aborts an in-flight request if the query
  changes.
- Tracks the query associated with results, so stale results are not returned
  for a newer query.
- Exposes results, loading state, error text, and a retry function.

The retry function increments an internal ID, causing the effect to perform
the search again.

## User data and feedback hooks

### [`src/hooks/useWatchlist.jsx`](./src/hooks/useWatchlist.jsx)

`useWatchlist(movies)` manages saved movies and their viewing statuses.

- Reads `cineloom_watchlist` from `localStorage` when initialized.
- Keeps entries keyed by numeric TMDb movie ID.
- Saves the current watchlist to `localStorage` whenever it changes.
- Joins saved IDs to the currently loaded movie list to create `savedMovies`.
- Derives a total saved count, completed count, and approximate hours.
- Exposes `addMovie`, `removeMovie`, and `updateMovieStatus`.

New entries begin with status `want` and an ISO date. Supported statuses are
`want`, `watching`, and `completed`; the special status `none` removes an
entry. The estimated hours use a fixed 2.4 hours per saved movie, not each
movie's actual runtime.

### [`src/hooks/useCommunityPosts.jsx`](./src/hooks/useCommunityPosts.jsx)

`useCommunityPosts()` manages community posts and the selected post filter.

- Reads saved posts from `cineloom_community_posts`; if none exist, it copies
  the initial posts from the data module.
- Reads and validates the saved filter from `cineloom_community_filter`.
- Persists posts and filter changes in `localStorage`.
- Derives `filteredPosts` for the `all`, `review`, `theory`, or `discussion`
  filter.
- `addPost` prepends a post and assigns it an ID based on the current time.
- `toggleUpvote` toggles the user's vote and adjusts the count by one.

This is browser-local persistence; it does not synchronize posts between
different users or devices.

### [`src/hooks/useToast.jsx`](./src/hooks/useToast.jsx)

`useToast()` manages short-lived status messages.

- Returns `toast` and `showToast`.
- `showToast(message, icon)` displays the message and clears it after three
  seconds.
- Clears an earlier timer before starting a new one, so messages do not leave
  multiple dismissal timers running.
- Cleans up the pending timer when the hook's owner unmounts.

The `ToastNotification` component renders the returned `toast` object.

## Initial data

### [`src/data/movies.jsx`](./src/data/movies.jsx)

This module exports `INITIAL_COMMUNITY_POSTS`, currently an empty array. It is
the fallback starting dataset used by `useCommunityPosts` when the browser has
no saved community posts.

Movie catalog data is not hard-coded here; it is loaded from TMDb through the
server API.

## How the files work together

### Discover and search

1. `main.jsx` mounts `App`.
2. `App` calls `useMovies`, which calls `fetchMovieSections`.
3. The API helper sends a request to `/api/movies`; during development, Vite
   proxies it to the Express server, while Netlify rewrites it to a Netlify
   Function.
4. `useMovies` exposes the result to `App`, which passes it to `DiscoverView`.
5. Search text travels from the header to `App`, then to `useMovieSearch`.
6. After the minimum query length and debounce delay, search results are
   returned to `DiscoverView`.

### Movie details and watchlist

1. A movie card calls the `onOpenMovie` callback supplied by `App`.
2. `App` sets the selected movie, which triggers `useMovieDetails`.
3. The details hook fetches extended information; `App` passes it to
   `MovieModal`.
4. Watchlist actions update `useWatchlist`; the hook persists the result in
   browser storage.
5. `App` displays a toast to confirm the action.

### Community posts

1. `useCommunityPosts` initializes posts and filters from browser storage.
2. `CommunityView` displays the filtered list and opens `CreatePostModal`.
3. `App` validates the selected movie and sends the completed post to
   `addPost`.
4. The hook updates state and persists it; post upvotes use
   `toggleUpvote`.

## Data flow summary

```text
React UI
  App.jsx
   ├── useMovies / useMovieSearch / useMovieDetails
   │     └── api/tmdb.jsx
   │           └── /api proxy (Vite) → Express server → TMDb
   ├── useWatchlist → browser localStorage
   ├── useCommunityPosts → browser localStorage
   └── useToast → timed in-memory notification
```

## Notes

- The movie and search requests require a valid TMDb read access token in the
  server environment; on Netlify, set `TMDB_READ_ACCESS_TOKEN` in site
  environment variables.
- Watchlist and community information is stored in the current browser.
- Watchlist entries include a movie snapshot so search results not present in
  the home-page sections remain visible. Legacy ID-only entries are restored
  through the movie-details endpoint when possible.
- Community comment counts are part of the displayed post shape, but this
  selected source does not include a comment-creation feature.
- The watchlist hour value is an estimate based on a fixed per-movie amount.
