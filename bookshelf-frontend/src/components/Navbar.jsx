import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const user      = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-coffee-700 px-8 py-3 flex items-center justify-between">
      <Link to="/" className="text-coffee-100 font-serif text-lg tracking-wide">
        ☕ Brewed Pages
      </Link>

      <div className="flex items-center gap-5">
        <Link to="/books" className="text-coffee-300 hover:text-coffee-100 text-sm font-sans transition">
          Browse
        </Link>

        {token ? (
          <>
            <span className="text-coffee-300 text-sm font-sans">
              Hi, {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-coffee-300 hover:text-coffee-100 text-sm font-sans transition"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login"
              className="text-coffee-300 hover:text-coffee-100 text-sm font-sans transition">
              Sign in
            </Link>
            <Link to="/signup"
              className="bg-coffee-600 text-coffee-100 text-sm font-sans px-4 py-1.5 rounded hover:bg-coffee-500 transition">
              Join free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}