import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from './pages/Explore';
import MyShelf from './pages/MyShelf';
import Discussion from './pages/Discussion';

function App() {
  const [user, setUser] = useState(null);

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

  return (
    <Router>
      <div className="flex min-h-screen bg-[#f5ede0]">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1 ml-56">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/books" element={<Books user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/books" /> : <Login onLogin={handleLogin} />} />
            <Route path="/signup" element={user ? <Navigate to="/books" /> : <Signup onLogin={handleLogin} />} />
            <Route path="/explore" element={<Explore user={user} />} />
            <Route path="/shelf" element={<MyShelf user={user} />} />
            <Route path="/books/:bookId/discussion" element={<Discussion user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;