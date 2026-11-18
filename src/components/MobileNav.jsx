const NAV_ITEMS = [
  { id: "discover", label: "Discover", icon: "fa-film" },
  { id: "community", label: "Community", icon: "fa-comments" },
  { id: "watchlist", label: "Watchlist", icon: "fa-bookmark" },
];

export default function MobileNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-black/10 bg-[#fbfaf6]/95 px-6 py-2.5 text-[10px] backdrop-blur-md md:hidden">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTabChange(item.id)}
          className={`mob-nav flex min-w-16 flex-col items-center gap-1 ${
            activeTab === item.id
              ? "font-medium text-netflix-butter"
              : "text-netflix-gray"
          }`}
        >
          <i className={`fa-solid ${item.icon} text-base`} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
