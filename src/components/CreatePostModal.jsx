export default function CreatePostModal({ movies, onClose, onPublish }) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onPublish({
      movieId: formData.get("movieId"),
      type: formData.get("type"),
      rating: Number(formData.get("rating")),
      author: formData.get("author").trim(),
      content: formData.get("content").trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="relative w-full max-w-lg space-y-5 overflow-hidden rounded-xl border border-black/10 bg-netflix-card p-6 shadow-2xl shadow-black/15"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="createPostTitle"
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <h2
            id="createPostTitle"
            className="flex items-center space-x-2 text-base font-bold text-netflix-black"
          >
            <i className="fa-solid fa-pen-nib text-netflix-butter" />
            <span>Create Community Post</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-netflix-gray hover:text-netflix-black"
            aria-label="Close create post dialog"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="postMovieSelect"
              className="mb-1 block text-xs font-semibold text-netflix-gray"
            >
              Select Movie
            </label>
            <select
              id="postMovieSelect"
              name="movieId"
              required
              className="field-control w-full rounded-md p-2.5 text-xs focus:border-netflix-butter focus:outline-none"
            >
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="postTypeSelect"
                className="mb-1 block text-xs font-semibold text-netflix-gray"
              >
                Post Type
              </label>
              <select
                id="postTypeSelect"
                name="type"
                className="field-control w-full rounded-md p-2.5 text-xs focus:border-netflix-butter focus:outline-none"
              >
                <option value="review">Review</option>
                <option value="theory">Theory</option>
                <option value="discussion">Discussion</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="postRatingSelect"
                className="mb-1 block text-xs font-semibold text-netflix-gray"
              >
                Your Rating (1-5)
              </label>
              <select
                id="postRatingSelect"
                name="rating"
                className="field-control w-full rounded-md p-2.5 text-xs focus:border-netflix-butter focus:outline-none"
              >
                <option value="5">★★★★★ (5/5)</option>
                <option value="4">★★★★☆ (4/5)</option>
                <option value="3">★★★☆☆ (3/5)</option>
                <option value="2">★★☆☆☆ (2/5)</option>
                <option value="1">★☆☆☆☆ (1/5)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="postAuthorInput"
              className="mb-1 block text-xs font-semibold text-netflix-gray"
            >
              Your Username
            </label>
            <input
              id="postAuthorInput"
              name="author"
              required
              placeholder="e.g. Cinephile99"
              className="field-control w-full rounded-md p-2.5 text-xs focus:border-netflix-butter focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="postContentInput"
              className="mb-1 block text-xs font-semibold text-netflix-gray"
            >
              Review / Discussion Content
            </label>
            <textarea
              id="postContentInput"
              name="content"
              rows="4"
              required
              placeholder="Write your thoughts here..."
              className="field-control w-full rounded-md p-2.5 text-xs focus:border-netflix-butter focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-black/10 px-4 py-2 text-xs font-medium text-netflix-lightgray transition-colors hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-netflix-red px-5 py-2 text-xs font-medium text-netflix-black transition-colors hover:bg-netflix-darkred"
            >
              Publish Post
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
