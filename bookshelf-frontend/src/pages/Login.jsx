import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email: identifier, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin && onLogin(res.data.user);
      navigate("/books");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log in. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5ede0]">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          {/* PASTE_ICON: cozy mug SVG here */}
          <span className="text-5xl block mb-3">☕</span>
          <h1 className="text-3xl font-bold text-[#3d2b1f]" style={{ fontFamily: "Georgia, serif" }}>
            Brewed Pages
          </h1>
          <p className="text-[#8b6b4e] text-sm mt-1">Your cozy corner for book reviews</p>
        </div>

        <div className="bg-[#faf7f2] rounded-2xl shadow-md border border-[#e8d5c0] p-8">
          <h2 className="text-xl font-semibold text-[#3d2b1f] mb-6" style={{ fontFamily: "Georgia, serif" }}>
            Welcome back 👋
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5c3d2e] mb-1">
                Email or username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="you@example.com or bookworm42"
                className="w-full px-4 py-2.5 bg-white border border-[#d6b896] rounded-xl text-[#3d2b1f] placeholder-[#b89a7a] focus:outline-none focus:ring-2 focus:ring-[#c9956a] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5c3d2e] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-[#d6b896] rounded-xl text-[#3d2b1f] placeholder-[#b89a7a] focus:outline-none focus:ring-2 focus:ring-[#c9956a] text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5c3d2e] hover:bg-[#3d2b1f] text-[#faf7f2] font-medium py-2.5 rounded-xl transition-colors text-sm mt-2 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in ☕"}
            </button>
          </form>

          <p className="text-center text-sm text-[#8b6b4e] mt-6">
            New here?{" "}
            <Link to="/signup" className="text-[#5c3d2e] font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}