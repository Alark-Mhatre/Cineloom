import { useEffect, useState } from "react";
import CommunityView from "./components/CommunityView.jsx";
import CreatePostModal from "./components/CreatePostModal.jsx";
import DiscoverView from "./components/DiscoverView.jsx";
import ErrorView from "./components/ErrorView.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import MobileNav from "./components/MobileNav.jsx";
import MovieModal from "./components/MovieModal.jsx";
import ToastNotification from "./components/ToastNotification.jsx";
import WatchlistView from "./components/WatchlistView.jsx";
import { useCommunityPosts } from "./hooks/useCommunityPosts.jsx";
import { useMovieDetails } from "./hooks/useMovieDetails.jsx";
import { useMovies } from "./hooks/useMovies.jsx";
import { useMovieSearch } from "./hooks/useMovieSearch.jsx";
import { useToast } from "./hooks/useToast.jsx";
import { useWatchlist } from "./hooks/useWatchlist.jsx";

// For internal mapping, initialisation of constants
const WATCHLIST_STATUS_LABELS = {
  want: "Want to Watch",
  watching: "Currently Watching",
  completed: "Watched",
};
const VALID_TABS = new Set(["discover", "community", "watchlist"]);

// to check in localStorage for the user's preferred tab active right now, if none is active we port user to discover tab
function getInitialTab() {
  const savedTab = localStorage.getItem("cineloom_active_tab");
  return VALID_TABS.has(savedTab) ? savedTab : "discover";
}

//useState hook to manage the state of local state
export default function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [pathname, setPathname] = useState(window.location.pathname);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { sections, movies, isLoading, error, retry } = useMovies();
  const {
    watchlist,
    savedMovies,
    stats,
    storageWarning: watchlistStorageWarning,
    recoveryError,
    retryRecovery,
    addMovie,
    removeMovie,
    updateMovieStatus,
  } = useWatchlist(movies);
  const {
    filteredPosts,
    filter,
    setFilter,
    addPost,
    toggleUpvote,
    storageWarning: postsStorageWarning,
  } =
    useCommunityPosts();
  const { toast, showToast } = useToast();
  const movieDetailsState = useMovieDetails(selectedMovie);
  const {
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    retry: retrySearch,
  } = useMovieSearch(searchQuery);
  const selectedMovieDetails =
    movieDetailsState.id === selectedMovie?.id
      ? movieDetailsState.details
      : null;

  useEffect(() => {
    localStorage.setItem("cineloom_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const warnings = [watchlistStorageWarning, postsStorageWarning].filter(Boolean);
    if (warnings.length) {
      showToast(warnings.join(" "), "fa-circle-exclamation");
    }
  }, [watchlistStorageWarning, postsStorageWarning, showToast]);

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  //Changes the active view tab and smoothly scrolls the window back to the top
  function switchTab(tab) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToWatchlist(movie) {
    const savedEntry = watchlist[movie.id];
    if (savedEntry) {
      showToast(
        `Already added to ${WATCHLIST_STATUS_LABELS[savedEntry.status] || "your watchlist"}.`,
        "fa-circle-info",
      );
      return;
    }

    addMovie(movie);
    showToast("Added to Want to Watch.", "fa-circle-check");
  }

  function removeFromWatchlist(movieId) {
    if (!watchlist[movieId]) {
      showToast("This movie is already removed from your watchlist.", "fa-circle-info");
      return;
    }

    removeMovie(movieId);
    showToast("Removed from your watchlist.", "fa-circle-minus");
  }

  function updateWatchlistStatus(movie, status) {
    const currentEntry = watchlist[movie.id];

    if (status === "none") {
      removeFromWatchlist(movie.id);
      return;
    }

    if (currentEntry?.status === status) {
      showToast(
        `Already added to ${WATCHLIST_STATUS_LABELS[status]}.`,
        "fa-circle-info",
      );
      return;
    }

    updateMovieStatus(movie, status);
    showToast(
      currentEntry
        ? `Moved to ${WATCHLIST_STATUS_LABELS[status]}.`
        : `Added to ${WATCHLIST_STATUS_LABELS[status]}.`,
      "fa-circle-check",
    );
  }

  function handleSearch(query) {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveTab("discover");
      setSelectedMovie(null);
    }
  }

  function publishPost(postDetails) {
    const movie = movies.find(
      (item) => String(item.id) === String(postDetails.movieId),
    );
    if (!movie) {
      showToast("Choose a movie before publishing your post.", "fa-circle-info");
      return;
    }

    addPost({
      ...postDetails,
      movieTitle: movie.title,
      timestamp: "Just now",
      upvotes: 1,
      commentsCount: 0,
      userUpvoted: true,
    });
    setIsCreatePostOpen(false);
    showToast("Your post has been published successfully!");
  }

  async function sharePost(postId) {
    const postUrl = `${window.location.href.split("#")[0]}#post-${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      showToast("Post link copied to clipboard!");
    } catch {
      showToast("Could not copy the post link.", "fa-circle-exclamation");
    }
  }

  if (pathname === "/error") {
    return <ErrorView />;
  }

  return (
    <>
      <Header
        activeTab={activeTab}
        onTabChange={switchTab}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onCreatePost={() => setIsCreatePostOpen(true)}
        canCreatePost={movies.length > 0}
      />
      <MobileNav activeTab={activeTab} onTabChange={switchTab} />

      <main className="flex-grow pb-24 md:pb-12">
        {activeTab === "discover" && (
          <DiscoverView
            sections={sections}
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearchLoading={isSearchLoading}
            searchError={searchError}
            onRetrySearch={retrySearch}
            isLoading={isLoading}
            error={error}
            onRetry={retry}
            watchlist={watchlist}
            onOpenMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
          />
        )}
        {activeTab === "community" && (
          <CommunityView
            posts={filteredPosts}
            filter={filter}
            onFilterChange={setFilter}
            onCreatePost={() => setIsCreatePostOpen(true)}
            canCreatePost={movies.length > 0}
            onUpvote={toggleUpvote}
            onShare={sharePost}
          />
        )}
        {activeTab === "watchlist" && (
          <WatchlistView
            movies={savedMovies}
            stats={stats}
              recoveryError={recoveryError}
              onRetryRecovery={retryRecovery}
            onOpenMovie={setSelectedMovie}
            onRemoveMovie={removeFromWatchlist}
          />
        )}
      </main>

      <Footer />
      <ToastNotification toast={toast} />

      <MovieModal
        movie={selectedMovieDetails || selectedMovie}
        detailsStatus={movieDetailsState.status}
        detailsError={movieDetailsState.error}
        watchlistEntry={selectedMovie ? watchlist[selectedMovie.id] : null}
        onClose={() => setSelectedMovie(null)}
        onUpdateStatus={updateWatchlistStatus}
      />
      {isCreatePostOpen && (
        <CreatePostModal
          movies={movies}
          onClose={() => setIsCreatePostOpen(false)}
          onPublish={publishPost}
        />
      )}
    </>
  );
}
