import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white tracking-tight">
          Nes<span className="text-emerald-400">tor</span>
        </Link>

        {/* Links — removed; actions live on the Home / Listings pages */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
          {user && (
            <Link to="/add-property" className="hover:text-white transition">
              Post Property
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg glass hover:glass-light transition text-lg"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {user ? (
            <>
              <Link
                to="/favourites"
                className="text-sm text-white/70 hover:text-white transition hidden md:block"
              >
                🤍 Saved
              </Link>
              <Link
                to="/dashboard"
                className="text-sm text-white/70 hover:text-white transition hidden md:block"
              >
                Hi, {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-lg glass hover:glass-light text-white/80 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-4 py-2 rounded-lg glass hover:glass-light text-white/80 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 rounded-lg bg-emerald-500/80 backdrop-blur text-white hover:bg-emerald-500 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
