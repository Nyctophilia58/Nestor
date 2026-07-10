import { useState } from 'react'
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar on login and register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white tracking-tight" onClick={closeMenu}>
            Nes<span className="text-emerald-400">tor</span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/favourites"
                  className="text-lg text-white/70 hover:text-white transition"
                >
                  ❤️
                </Link>

                <Link to="/profile" className="text-sm text-white/70 hover:text-white transition">
                  {/* Avatar */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                {/* Hamburger Menu */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg glass hover:glass-light transition"
                >
                  {menuOpen ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 2L16 16M16 2L2 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 4H16M2 9H16M2 14H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl glass text-white/70 hover:glass-light hover:text-white transition text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-emerald-500/80 text-white hover:bg-emerald-500 transition text-sm font-medium mt-1"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className='fixed inset-0 z-40 flex flex-col' onClick={closeMenu}>
          <div className='absolute inset-0 bg-black/50 backdrop-blur-sm'/>
          <div className='absolute top-[65px] right-4 w-72 glass-light rounded-2xl border border-white/10 p-3 shadow-2xl space-y-1'>
              {/* User Info */}
              <div className='flex items-center gap-3 p-3 mb-2 glass rounded-xl' onClick={() => { navigate('/profile'); closeMenu(); }}>
                {user!.avatar ? (
                  <img src={user!.avatar} alt="avatar" className='w-10 h-10 rounded-full object-cover' />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" clipRule="evenodd" />
                  </svg>
                )}
                <div className='min-w-0'>
                  <p className="text-white font-medium text-sm truncate">{user!.name}</p>
                  <p className="text-white/50 text-xs truncate">{user!.role}</p>
                </div>
                {user!.role === 'admin' && (
                  <span className="ml-auto flex-shrink-0 text-xs text-purple-400 bg-purple-500/10 border border-purple-400/20 px-2 py-0.5 rounded-full">
                    👑
                  </span>
                )}
              </div>


              {/* Nav Links */}
              {[
                ...(user!.role === 'admin'
                  ? [{ to: '/admin', label: '👑', text: 'Admin Panel' }]
                  : []
                ),
                { to: '/dashboard', label: '👤', text: 'Dashboard' },
                { to: '/favourites', label: '❤️', text: 'Favourites' },
                { to: '/settings', label: '⚙️', text: 'Settings' },
                ...(user!.role === 'tenant' || user!.role === 'admin')
                  ? [{ to: '/listings', label: '🔍', text: 'Find a Property' }]
                  : [],
                ...(user!.role === 'landlord' || user!.role === 'admin'
                  ? [{ to: '/add-property', label: '🏠', text: 'List a Property' }]
                  : []
                ),
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:glass transition text-sm"
                >
                  <span className="w-6 text-center">{link.label}</span>
                  {link.text}
                </Link>
              ))}

              {/* Divider */}
              <div className="my-1 h-px bg-white/10" />

              {/* Theme Toggle */}
              <button onClick={toggle} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:glass transition text-sm">
                <span className="w-6 text-center">🌙</span>
                {dark ? 'Dark' : 'Light'}
              </button>

              {/* Logout */}
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm">
                <span className="w-6 text-center">🚪</span>
                Logout
              </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
