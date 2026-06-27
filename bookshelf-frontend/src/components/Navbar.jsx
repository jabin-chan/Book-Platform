import { Link, useNavigate, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/books", label: "Bookshelf", icon: "📚" },
];

const SHELF_LINKS = [
  { label: "Currently Reading", icon: "📖", hash: "currently_reading" },
  { label: "Want to Read", icon: "🔖", hash: "want_to_read" },
  { label: "Finished", icon: "✅", hash: "finished" },
];

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout && onLogout();
    navigate("/");
  };

  return (
    <aside className="w-56 min-h-screen bg-[#3d2b1f] text-[#faf7f2] flex flex-col fixed left-0 top-0 z-20 shadow-xl">
      <div className="px-5 pt-7 pb-5 border-b border-[#5c3d2e]">
        <div className="flex items-center gap-2 mb-1">
          {/* PASTE_ICON: mug or book SVG here (24x24, white stroke) */}
          <span className="text-2xl">☕</span>
          <span className="text-lg font-bold text-[#faf7f2]" style={{ fontFamily: "Georgia, serif" }}>
            Brewed Pages
          </span>
        </div>
        <p className="text-[#b89a7a] text-xs">Your reading nook</p>
      </div>

      <nav className="px-3 py-4 flex-1">
        <p className="text-[#8b6b4e] text-xs font-medium uppercase tracking-widest px-2 mb-2">Navigate</p>
        {NAV_LINKS.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                active
                  ? "bg-[#5c3d2e] text-[#faf7f2]"
                  : "text-[#d6b896] hover:bg-[#4d3020] hover:text-[#faf7f2]"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}

        <p className="text-[#8b6b4e] text-xs font-medium uppercase tracking-widest px-2 mt-5 mb-2">My Shelf</p>
        {SHELF_LINKS.map(({ label, icon, hash }) => (
          <Link
            key={hash}
            to={`/books#${hash}`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-1 text-[#d6b896] hover:bg-[#4d3020] hover:text-[#faf7f2] transition-colors"
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}

        <div className="mt-6 px-2 opacity-30">
          <div className="h-px bg-[#8b6b4e] mb-3" />
          {/* PASTE_ICON: plant or candle SVG here */}
          <div className="text-center text-2xl">🌿</div>
        </div>
      </nav>

      <div className="border-t border-[#5c3d2e] px-4 py-4">
        {user ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#c9956a] flex items-center justify-center text-sm font-bold text-[#3d2b1f]">
                {user.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-[#faf7f2]">{user.username}</p>
                <p className="text-xs text-[#8b6b4e]">📖 Reader</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-xs text-[#b89a7a] hover:text-[#faf7f2] py-1.5 rounded-lg border border-[#5c3d2e] hover:border-[#8b6b4e] transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              className="block w-full text-center bg-[#c9956a] hover:bg-[#b8845a] text-[#3d2b1f] font-medium text-sm py-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="block w-full text-center border border-[#5c3d2e] hover:border-[#8b6b4e] text-[#d6b896] text-sm py-2 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}