import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">
            Sukiru
          </span>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-stone group-hover:text-stamp-dark transition-colors">
            時間
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#how-it-works" className="text-stone hover:text-ink transition-colors hidden sm:inline">
            How it works
          </Link>
          <Link href="/#stack" className="text-stone hover:text-ink transition-colors hidden sm:inline">
            Built with
          </Link>
          <Link
            href="/login"
            className="border border-ink text-ink px-4 py-2 rounded-md text-sm font-medium hover:bg-ink hover:text-paper transition-colors"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
