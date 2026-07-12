import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-14">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">Nestor</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Nestor helps you find trusted listings without brokers, fake
              listings, or unnecessary hassle.
            </p>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              <span className="text-emerald-400">✉ </span>
              nowtechdev@gmail.com
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5">Platform</h3>
            <ul className="space-y-3">
              {[
                { label: "Find Properties", path: "/listings" },
                { label: "Post Property", path: "/add-property" },
                { label: "Saved Properties", path: "/favourites" },
                { label: "Dashboard", path: "/dashboard" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-white/40 text-sm hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "Help Center", path: "/help-center" },
                { label: "Privacy Policy", path: "/privacy-policy" },
                { label: "Terms of Service", path: "/terms-of-service" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-white/40 text-sm hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5">
              Connect With Us
            </h3>
            <div className="flex gap-3 mb-6">
              {[
                {
                  label: <i className="fa fa-facebook"></i>,
                  href:
                    import.meta.env.VITE_FACEBOOK_URL || "https://facebook.com",
                },
                {
                  label: <i className="fa fa-linkedin"></i>,
                  href:
                    import.meta.env.VITE_LINKEDIN_URL || "https://linkedin.com",
                },
                {
                  label: <i className="fa fa-github"></i>,
                  href: import.meta.env.VITE_GITHUB_URL || "https://github.com",
                },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 glass rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:glass-light transition text-xs font-bold"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-6">
              Trusted by renters & landlords in Bangladesh
              <br />
              Secure • Transparent • Broker-free
            </p>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Nestor",
                    text: "Find your perfect home in Bangladesh — no brokers!",
                    url: window.location.origin,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.origin);
                  toast.success("Link copied to clipboard!");
                }
              }}
              className="w-full py-3 glass-light rounded-xl text-white text-sm font-medium hover:glass transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Nestor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
