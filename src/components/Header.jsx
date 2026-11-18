const NAV_ITEMS = [
  { id: "discover", label: "Discover" },
  { id: "community", label: "Community" },
  { id: "watchlist", label: "Watchlist" },
];

export default function Header({
  activeTab,
  onTabChange,
  onSearch,
  searchQuery,
  onCreatePost,
  canCreatePost,
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-black/10 bg-[#fbfaf6]/95 px-5 backdrop-blur-md md:px-10">
      <div className="flex min-w-0 items-center space-x-8">
        <button
          type="button"
          onClick={() => onTabChange("discover")}
          className="shrink-0 text-lg font-semibold tracking-tight text-netflix-black"
          aria-label="Cineloom home"
        >
          Cine<span className="text-netflix-butter">loom</span>
        </button>
        <nav className="hidden h-16 items-center space-x-7 text-[13px] md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`nav-link h-full whitespace-nowrap border-b-2 pt-0.5 transition-colors hover:text-netflix-black ${
                activeTab === item.id
                  ? "border-netflix-butter font-medium text-netflix-black"
                  : "border-transparent text-netflix-gray"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center space-x-3 md:space-x-4">
        <label className="relative hidden sm:block">
          <span className="sr-only">Search movies and genres</span>
          <input
            type="search"
            placeholder="Search movies or genres"
            value={searchQuery}
            onChange={(event) => onSearch(event.target.value)}
            className="field-control w-40 rounded-md py-2 pl-9 pr-3 text-xs transition-colors focus:border-netflix-butter focus:outline-none lg:w-52"
          />
          <i className="fa-solid fa-search absolute left-3 top-2.5 text-xs text-netflix-gray" />
        </label>
        <button
          type="button"
          onClick={onCreatePost}
          disabled={!canCreatePost}
          aria-label="Write a post"
          title="Write a post"
          className="flex items-center space-x-2 rounded-md border border-black/10 px-3 py-2 text-xs font-medium text-netflix-lightgray transition-colors hover:border-netflix-butter hover:text-netflix-butter disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="fa-solid fa-plus" />
          <span className="hidden md:inline">Write a post</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("watchlist")}
          title="Profile & Watchlist"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/5 text-[10px] font-semibold text-netflix-lightgray transition-colors hover:border-netflix-butter"
        >
          CL
        </button>
      </div>
    </header>
  );
}
