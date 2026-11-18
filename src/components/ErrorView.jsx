export default function ErrorView() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-netflix-page px-5 py-16 text-center">
      <section className="max-w-xl">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-netflix-butter">
          A brief intermission
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-netflix-black sm:text-6xl">
          Oops, we’ll be right back.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-netflix-gray sm:text-base">
          Something went wrong. Hold on to your seat tight while we get things
          back on screen.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          className="mt-8 rounded-md bg-netflix-red px-5 py-3 text-xs font-semibold text-netflix-black transition-colors hover:bg-netflix-darkred"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
