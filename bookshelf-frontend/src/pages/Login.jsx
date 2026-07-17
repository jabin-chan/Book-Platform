import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Coffee, AlertCircle } from "lucide-react";
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
      navigate("/shelf");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log in. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBEDD1] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Coffee size={44} className="mx-auto mb-3 text-[#4A3423]" strokeWidth={1.6} />
          <h1 className="text-3xl font-bold text-[#4A3423]" style={{ fontFamily: "Georgia, serif" }}>
            Brewed Pages
          </h1>
          <p className="text-[#4A3423]/60 text-sm mt-1">Your cozy corner for book reviews</p>
        </div>

        <div
          className="bg-[#FFFDF6] p-8"
          style={{
            borderRadius: "28px 20px 30px 18px",
            border: "3.5px solid #4A3423",
            boxShadow: "7px 7px 0 rgba(74,52,35,0.9)",
          }}
        >
          <h2 className="text-xl font-semibold text-[#4A3423] mb-6" style={{ fontFamily: "Georgia, serif" }}>
            Welcome back
          </h2>

          {error && (
            <div className="flex items-start gap-2 bg-[#FBEDD1] border-2 border-[#4A3423] rounded-xl px-4 py-2.5 mb-4 text-sm text-[#4A3423]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A3423] mb-1">
                Email or username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="you@example.com or bookworm42"
                className="w-full px-4 py-2.5 bg-[#FFFDF6] border-2 border-[#D8C69B] rounded-xl text-[#4A3423] placeholder-[#4A3423]/35 focus:outline-none focus:border-[#4A3423] focus:ring-4 focus:ring-[#A3B899]/25 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A3423] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#FFFDF6] border-2 border-[#D8C69B] rounded-xl text-[#4A3423] placeholder-[#4A3423]/35 focus:outline-none focus:border-[#4A3423] focus:ring-4 focus:ring-[#A3B899]/25 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A3B899] hover:bg-[#93A889] text-[#33422F] font-semibold py-3 rounded-full text-sm mt-2 disabled:opacity-60 border-2 border-[#4A3423] shadow-[4px_4px_0_#4A3423] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#4A3423] active:translate-y-0 active:shadow-[2px_2px_0_#4A3423] transition-all"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-[#4A3423]/70 mt-6">
            New here?{" "}
            <Link to="/signup" className="text-[#4A3423] font-semibold border-b-2 border-[#A3B899] hover:border-[#4A3423] transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}