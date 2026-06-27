import { Link } from "react-router-dom";

const READING_SECTIONS = [
  { id: "currently_reading", label: "Currently Reading", icon: "📖", color: "#ffd6e0", border: "#ff6b9d", desc: "What you're diving into right now" },
  { id: "want_to_read", label: "Want to Read", icon: "🔖", color: "#d0eaff", border: "#3a86ff", desc: "Your reading wish list" },
  { id: "finished", label: "Finished", icon: "✅", color: "#d4f1e4", border: "#2dc653", desc: "Books you've completed" },
];

const GENRE_PILLS = [
  { label: "Fantasy", color: "#e8d5f5", text: "#5b2d8e" },
  { label: "Romance", color: "#ffd6e0", text: "#8b2252" },
  { label: "Sci-Fi", color: "#d0eaff", text: "#1a3d7c" },
  { label: "Mystery", color: "#d4f1e4", text: "#0f5c2e" },
  { label: "Thriller", color: "#ffe5d9", text: "#7a2c1e" },
  { label: "Nonfiction", color: "#fff3cd", text: "#7c4200" },
  { label: "History", color: "#dde5b6", text: "#2d5016" },
  { label: "Memoir", color: "#ffebc8", text: "#7d5500" },
];

export default function Home({ user }) {
  return (
    <div className="min-h-screen bg-[#f5ede0] px-6 py-8 max-w-3xl">
      <section className="mb-10">
        <div className="flex items-start gap-4 mb-4">
          <div>
            {/* PASTE_ICON: large open book SVG here */}
            <span className="text-5xl block mb-2">📚</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#3d2b1f] leading-snug" style={{ fontFamily: "Georgia, serif" }}>
              {user ? `Welcome back, ${user.username} ☕` : "Welcome to Brewed Pages"}
            </h1>
            <p className="text-[#8b6b4e] mt-2 text-sm leading-relaxed max-w-md">
              A cozy corner to track your reads, share reviews, and discover your next favourite book — one cup at a time.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-5 flex-wrap">
          <Link to="/books" className="bg-[#5c3d2e] hover:bg-[#3d2b1f] text-[#faf7f2] text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            Browse the Shelf →
          </Link>
          {!user && (
            <Link to="/signup" className="border border-[#c9956a] text-[#5c3d2e] hover:bg-[#f5e6d3] text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              Join for free
            </Link>
          )}
        </div>
      </section>

      <div className="flex items-center gap-3 mb-8 opacity-50">
        <div className="h-px flex-1 bg-[#c9956a]" />
        {/* PASTE_ICON: candle SVG (24x24) here */}
        <span className="text-lg">🕯️</span>
        <div className="h-px flex-1 bg-[#c9956a]" />
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[#3d2b1f] mb-4" style={{ fontFamily: "Georgia, serif" }}>
          My Reading Nook
        </h2>
        {!user ? (
          <div className="bg-[#faf7f2] border border-[#e8d5c0] rounded-2xl p-5 text-center">
            <p className="text-[#8b6b4e] text-sm mb-3">Log in to track your reading progress</p>
            <Link to="/login" className="text-sm text-[#5c3d2e] font-medium hover:underline">Log in →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {READING_SECTIONS.map((s) => (
              <Link
                key={s.id}
                to={`/books#${s.id}`}
                className="block rounded-xl p-4 border-2 hover:shadow-md transition-shadow"
                style={{ backgroundColor: s.color, borderColor: s.border }}
              >
                <span className="text-2xl block mb-2">{s.icon}</span>
                <p className="font-semibold text-[#3d2b1f] text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  {s.label}
                </p>
                <p className="text-xs text-[#5c3d2e] mt-1 opacity-75">{s.desc}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[#3d2b1f] mb-3" style={{ fontFamily: "Georgia, serif" }}>
          Browse by Genre
        </h2>
        <div className="flex flex-wrap gap-2">
          {GENRE_PILLS.map((g) => (
            <Link
              key={g.label}
              to="/books"
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: g.color, color: g.text }}
            >
              {g.label}
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-12 text-center opacity-30 space-y-1">
        {/* PASTE_ICON: cat or plant SVG here */}
        <p className="text-3xl">🐱</p>
        <p className="text-xs text-[#8b6b4e]">bleh bleh bleh</p>
      </footer>
    </div>
  );
}