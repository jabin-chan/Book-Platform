import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from './pages/Explore';
import MyShelf from './pages/MyShelf';
import Discussion from './pages/Discussion';
import Profile from './pages/Profile';

function AppLayout() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  // Landing/auth pages have their own full-bleed centered card and don't
  // want the top nav competing with it
  const noNavRoutes = ["/"];;
  const showNav = !noNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#FBEDD1]">
      {showNav && <Navbar user={user} onLogout={handleLogout} />}
      <main className={showNav ? "pt-16" : ""}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/books" element={<Books user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/shelf" /> : <Login onLogin={handleLogin} />} />
          <Route path="/signup" element={user ? <Navigate to="/shelf" /> : <Signup onLogin={handleLogin} />} />
          <Route path="/explore" element={<Explore user={user} />} />
          <Route path="/shelf" element={<MyShelf user={user} />} />
          <Route path="/books/:bookId/discussion" element={<Discussion user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;