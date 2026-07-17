import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Coffee, Compass, Library, Lock, CircleUserRound, LogOut, User } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the profile dropdown on any click outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout && onLogout();
    setMenuOpen(false);
    navigate("/");
  };

  const linkClasses = (active) =>
    active
      ? "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold bg-[#A3B899] text-[#33422F] border-2 border-[#4A3423] shadow-[3px_3px_0_#4A3423]"
      : "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#4A3423]/60 border-2 border-transparent hover:bg-[#F5E5C9] hover:text-[#4A3423] transition-colors";

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#FFFDF6] border-b-[3.5px] border-[#4A3423]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        {/* Logo — home for guests, explore for logged-in users */}
        <Link to={user ? "/explore" : "/"} className="flex items-center gap-2 shrink-0">
          <Coffee size={24} className="text-[#4A3423]" strokeWidth={2} />
          <span className="text-lg font-bold text-[#4A3423]" style={{ fontFamily: "Georgia, serif" }}>
            Brewed Pages
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/explore" className={linkClasses(location.pathname === "/explore")}>
            <Compass size={16} />
            <span className="hidden sm:inline">Explore</span>
          </Link>

          <Link to="/shelf" className={linkClasses(location.pathname === "/shelf")}>
            <Library size={16} />
            <span className="hidden sm:inline">My Shelf</span>
            {!user && <Lock size={12} className="opacity-60" />}
          </Link>
        </nav>

        <div className="shrink-0">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center pl-1 pr-1 py-1 rounded-full border-2 border-[#4A3423] hover:bg-[#F5E5C9] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#C9956A] flex items-center justify-center text-sm font-bold text-[#4A3423]">
                  {user.username?.[0]?.toUpperCase() || <CircleUserRound size={18} />}
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#FFFDF6] border-2 border-[#4A3423] rounded-2xl shadow-[4px_4px_0_#4A3423] overflow-hidden">
                  <div className="px-4 py-3 border-b-2 border-[#D8C69B]">
                    <p className="text-sm font-semibold text-[#4A3423] truncate">{user.username}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#4A3423] hover:bg-[#F5E5C9] transition-colors"
                  >
                    <User size={15} />
                    View profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#4A3423] hover:bg-[#F5E5C9] transition-colors"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-[#4A3423]/70 hover:text-[#4A3423] px-3 py-2 transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold px-4 py-2 rounded-full bg-[#A3B899] text-[#33422F] border-2 border-[#4A3423] shadow-[3px_3px_0_#4A3423] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4A3423] transition-all"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}