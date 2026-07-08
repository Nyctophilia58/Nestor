import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navbar on login and register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

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

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg glass hover:glass-light transition text-lg"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {user ? (
            <>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="hover:text-white transition text-xs text-purple-400"
                >
                  👑 Admin
                </Link>
              )}
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
