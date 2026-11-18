import { useRef } from "react";
import MovieCard from "./MovieCard.jsx";

export default function MovieCarousel({
  id,
  title,
  movies,
  watchlist,
  onOpenMovie,
  onAddToWatchlist,
}) {
  const carouselRef = useRef(null);

  function scroll(direction) {
    carouselRef.current?.scrollBy({
      left: direction * 350,
      behavior: "smooth",
    });
  }

  return (
    <section className="border-t border-black/10 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-medium text-netflix-black md:text-lg">
          {title}
        </h2>
        <div className="flex gap-1.5">
          {[-1, 1].map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => scroll(direction)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-xs text-netflix-gray transition-colors hover:border-black/25 hover:text-netflix-black"
              aria-label={`${direction < 0 ? "Scroll left" : "Scroll right"} ${title}`}
            >
              <i
                className={`fa-solid fa-chevron-${
                  direction < 0 ? "left" : "right"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div
        ref={carouselRef}
        id={id}
        className="carousel-container hide-scrollbar flex space-x-4 overflow-x-auto pb-4 pt-1"
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isSaved={Boolean(watchlist[movie.id])}
            onOpen={onOpenMovie}
            onAddToWatchlist={onAddToWatchlist}
          />
        ))}
      </div>
    </section>
  );
}
