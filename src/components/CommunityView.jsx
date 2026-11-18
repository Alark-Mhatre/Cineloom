import CommunityPost from "./CommunityPost.jsx";

const FILTERS = [
  { id: "all", label: "All Posts" },
  { id: "review", label: "Reviews" },
  { id: "theory", label: "Theories" },
  { id: "discussion", label: "Discussions" },
];

export default function CommunityView({
  posts,
  filter,
  onFilterChange,
  onCreatePost,
  canCreatePost,
  onUpvote,
  onShare,
}) {
  return (
    <section className="mx-auto max-w-5xl space-y-7 px-5 pb-12 pt-28 md:px-10">
      <header className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-netflix-butter">
            The conversation
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-netflix-black">
            Community
          </h1>
          <p className="mt-2 text-sm text-netflix-gray">
            Reviews and conversations from other viewers.
          </p>
        </div>
        <div className="flex items-center gap-5 overflow-x-auto">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFilterChange(item.id)}
              className={`comm-filter-btn whitespace-nowrap border-b-2 pb-2 text-xs transition-colors ${
                filter === item.id
                  ? "border-netflix-butter text-netflix-black"
                  : "border-transparent text-netflix-gray hover:text-netflix-black"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <button
        type="button"
        onClick={onCreatePost}
        disabled={!canCreatePost}
        className="flex w-full items-center gap-3 border-b border-black/10 py-4 text-left transition-colors hover:border-netflix-butter disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-black/5 text-netflix-gray">
          <i className="fa-solid fa-pen text-xs" />
        </span>
        <span className="flex-grow text-sm text-netflix-gray">
          Start a conversation
          <span className="mt-1 block text-xs text-netflix-gray">
            Write a review, theory, or discussion
          </span>
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-md border border-black/10 px-3 py-2 text-xs font-medium text-netflix-lightgray">
          New post
        </span>
      </button>

      <div>
        {posts.length ? (
          posts.map((post) => (
            <CommunityPost
              key={post.id}
              post={post}
              onUpvote={onUpvote}
              onShare={onShare}
            />
          ))
        ) : (
          <div className="py-12 text-center text-xs text-netflix-gray">
            No community posts found for this filter. Be the first to post!
          </div>
        )}
      </div>
    </section>
  );
}
