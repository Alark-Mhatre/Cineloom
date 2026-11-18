import { useEffect, useMemo, useState } from "react";
import { INITIAL_COMMUNITY_POSTS } from "../data/movies.jsx";

const POSTS_STORAGE_KEY = "cineloom_community_posts";
const FILTER_STORAGE_KEY = "cineloom_community_filter";
const VALID_FILTERS = new Set(["all", "review", "theory", "discussion"]);

function readPosts() {
  const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
  if (!savedPosts) {
    return INITIAL_COMMUNITY_POSTS.map((post) => ({ ...post }));
  }

  const posts = JSON.parse(savedPosts);
  if (!Array.isArray(posts)) {
    throw new Error("Saved community posts are invalid. Clear Cineloom storage and reload.");
  }
  return posts;
}

function readFilter() {
  const savedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
  return VALID_FILTERS.has(savedFilter) ? savedFilter : "all";
}

export function useCommunityPosts() {
  const [posts, setPosts] = useState(readPosts);
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

  return { filteredPosts, filter, setFilter, addPost, toggleUpvote };
}
