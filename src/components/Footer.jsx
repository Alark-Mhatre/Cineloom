const LINKS = ["FAQ", "Community Guidelines", "Privacy Policy", "Contact Us"];

export default function Footer() {
  return (
    <footer className="space-y-3 border-t border-black/10 px-4 py-7 text-center text-xs text-netflix-gray md:px-12">
      <div className="flex justify-center gap-5">
        {LINKS.map((label) => (
          <a key={label} href="#" className="transition hover:text-netflix-black">
            {label}
          </a>
        ))}
      </div>
      <p>
        &copy; 2026 Cineloom. This product uses the TMDB API but is not endorsed
        or certified by TMDB.
      </p>
    </footer>
  );
}
