import { useEffect, useMemo, useState } from "react";
import { INITIAL_COMMUNITY_POSTS } from "../data/movies.jsx";

const POSTS_STORAGE_KEY = "cineloom_community_posts";
const FILTER_STORAGE_KEY = "cineloom_community_filter";
const VALID_FILTERS = new Set(["all", "review", "theory", "discussion"]);
const VALID_POST_TYPES = new Set(["review", "theory", "discussion"]);

function readPosts() {
  const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
  if (!savedPosts) {
    return {
      posts: INITIAL_COMMUNITY_POSTS.map((post) => ({ ...post })),
      warning: "",
    };
  }

  try {
    const posts = JSON.parse(savedPosts);
    if (!Array.isArray(posts)) {
      throw new Error("Saved community posts must be an array.");
    }

    const validPosts = posts.filter(
      (post) =>
        post &&
        (typeof post.id === "string" || typeof post.id === "number") &&
        VALID_POST_TYPES.has(post.type) &&
        Number.isFinite(post.rating) &&
        typeof post.author === "string" &&
        typeof post.content === "string" &&
        typeof post.movieTitle === "string" &&
        typeof post.timestamp === "string" &&
        Number.isFinite(post.upvotes) &&
        Number.isFinite(post.commentsCount) &&
        typeof post.userUpvoted === "boolean",
    );

    return {
      posts: validPosts,
      warning:
        validPosts.length === posts.length
          ? ""
          : "Some invalid saved community posts were removed.",
    };
  } catch (error) {
    console.error("Could not read saved community posts; resetting them:", error);
    localStorage.removeItem(POSTS_STORAGE_KEY);
    return {
      posts: INITIAL_COMMUNITY_POSTS.map((post) => ({ ...post })),
      warning: "Saved community posts were invalid and have been reset.",
    };
  }
}

function readFilter() {
  const savedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
  return VALID_FILTERS.has(savedFilter) ? savedFilter : "all";
}

export function useCommunityPosts() {
  const [initialData] = useState(readPosts);
  const [posts, setPosts] = useState(initialData.posts);
  const [filter, setFilter] = useState(readFilter);

  useEffect(() => {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, filter);
  }, [filter]);

  const filteredPosts = useMemo(
    () => (filter === "all" ? posts : posts.filter((post) => post.type === filter)),
    [filter, posts],
  );

  function addPost(post) {
    setPosts((current) => [{ ...post, id: Date.now() }, ...current]);
  }

  function toggleUpvote(postId) {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;
        const userUpvoted = !post.userUpvoted;
        return {
          ...post,
          userUpvoted,
          upvotes: post.upvotes + (userUpvoted ? 1 : -1),
        };
      }),
    );
  }

  return {
    filteredPosts,
    filter,
    setFilter,
    addPost,
    toggleUpvote,
    storageWarning: initialData.warning,
  };
}
