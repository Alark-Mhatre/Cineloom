const TYPE_COLORS = {
  review: "text-netflix-butter",
  theory: "text-netflix-gray",
  discussion: "text-netflix-gray",
};

export default function CommunityPost({ post, onUpvote, onShare }) {
  return (
    <article className="space-y-4 border-b border-black/10 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-black/5 text-xs font-medium text-netflix-lightgray">
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-medium text-netflix-black">{post.author}</h4>
            <p className="text-[10px] text-netflix-gray">{post.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={`uppercase tracking-wider ${TYPE_COLORS[post.type]}`}>
            {post.type}
          </span>
          <span className="text-netflix-gray">
            <i className="fa-solid fa-star mr-1 text-netflix-butter" />
            {post.rating}
          </span>
        </div>
      </div>

      <div>
        <span className="text-xs font-medium text-netflix-lightgray">
          {post.movieTitle}
        </span>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-netflix-lightgray">
          {post.content}
        </p>
      </div>

      <div className="flex items-center gap-5 pt-1 text-xs text-netflix-gray">
        <button
          type="button"
          onClick={() => onUpvote(post.id)}
          className={`flex items-center gap-2 transition-colors hover:text-netflix-butter ${
            post.userUpvoted ? "font-bold text-netflix-butter" : ""
          }`}
        >
          <i className="fa-solid fa-thumbs-up" />
          <span>{post.upvotes} Upvotes</span>
        </button>
        <span className="flex items-center space-x-1.5">
          <i className="fa-solid fa-comment" />
          <span>{post.commentsCount} Comments</span>
        </span>
        <button
          type="button"
          onClick={() => onShare(post.id)}
          className="ml-auto flex items-center gap-2 transition-colors hover:text-netflix-black"
        >
          <i className="fa-solid fa-share-nodes" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}
