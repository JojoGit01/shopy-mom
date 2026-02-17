export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} Shopy Mom</p>
        <p className="mt-1 text-xs text-slate-500">
          Simple • Privé • Fait avec ❤️
        </p>
      </div>
    </footer>
  );
}
