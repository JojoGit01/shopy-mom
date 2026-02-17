export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">🛍️</div>
          <div>
            <p className="text-lg font-semibold leading-none">Shopy Mom</p>
            <p className="text-xs text-slate-400">Wishlist familiale</p>
          </div>
        </div>

        {/* Badge */}
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          Private list
        </div>
      </div>
    </header>
  );
}
