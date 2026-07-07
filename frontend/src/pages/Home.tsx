import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Footer from "../components/Footer";
import { useAuthStore } from "../store/authStore";

const Home = () => {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("rent");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/listings?location=${search}&type=${type}`);
  };

  useEffect(() => {
    api.get("/properties", { params: { limit: 3 } }).catch(console.error);
  }, []);

  return (
    <div className="space-y-4 pb-16">
      {/* Hero */}
      <div className="py-16 px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
            🏠 Bangladesh's Broker-Free Property Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Buy, Sell, Rent
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            From cozy homes to busy offices — find your perfect space with us.
            Browse over thousands of properties — no brokers, no hassle, no
            commission.
          </p>

          {/* Search Box */}
          <div className="glass-light rounded-2xl p-6">
            <div className="flex gap-3 mb-4">
              {["rent", "sale"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    type === t
                      ? "bg-emerald-500 text-white"
                      : "glass text-white/70 hover:text-white"
                  }`}
                >
                  {t === "rent" ? "For Rent" : "For Sale"}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by location e.g. Dhanmondi, Dhaka"
                className="flex-1 px-4 py-3 rounded-lg glass text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
              <button
                onClick={handleSearch}
                className="px-5 py-3 bg-emerald-500/90 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition backdrop-blur"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Browse by Category */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Apartments",
                icon: "🏢",
                category: "apartment",
                desc: "Modern flats and condos",
              },
              {
                label: "Houses",
                icon: "🏠",
                category: "house",
                desc: "Family homes and villas",
              },
              {
                label: "Offices",
                icon: "🏛️",
                category: "office",
                desc: "Commercial spaces",
              },
            ].map((cat) => (
              <button
                key={cat.category}
                onClick={() => navigate(`/listings?category=${cat.category}`)}
                className="glass-card rounded-2xl p-6 flex items-center gap-4 text-left group"
              >
                <span className="text-4xl group-hover:scale-110 transition">
                  {cat.icon}
                </span>
                <div>
                  <p className="font-semibold text-white">{cat.label}</p>
                  <p className="text-sm text-white/50">{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Why Choose Us
          </h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-10">
            Trusted, transparent, and the smarter way to find your perfect home
            in Bangladesh.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "✅",
                title: "Verified Listings",
                desc: "Every property is reviewed before going live — no fake or duplicate listings.",
              },
              {
                icon: "📞",
                title: "Contact Owners Directly",
                desc: "Call or WhatsApp the owner directly — no agents, no commission fees.",
              },
              {
                icon: "৳",
                title: "Zero Commission",
                desc: "List your property for free. What you agree on is what you pay — nothing more.",
              },
              {
                icon: "🔍",
                title: "Smart Filters",
                desc: "Filter by location, price range, property type, bedrooms, and more.",
              },
              {
                icon: "❤️",
                title: "Save Favourites",
                desc: "Bookmark properties you love and revisit them anytime from your dashboard.",
              },
              {
                icon: "🏠",
                title: "Rent or Sell",
                desc: "Whether renting, buying, or listing — Nestor has you covered.",
              },
            ].map((f) => (
              <div key={f.title} className="glass-card p-6 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-emerald-500/15 text-emerald-400 rounded-lg text-lg flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                    <p className="text-white/50 text-sm">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Landlords */}
      {(!user || user.role !== "tenant") && (
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              For Landlords
            </h2>
            <p className="text-white/50 text-center max-w-2xl mx-auto mb-10">
              Fill vacant properties faster. Reach real tenants instantly and
              manage listings with a modern platform built for Bangladesh.
            </p>
            <div className="glass-light rounded-2xl p-8">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: "128%", label: "Avg. Monthly Views", icon: "📈" },
                  { value: "80%", label: "Response Rate", icon: "💬" },
                  { value: "3x", label: "Faster to Fill", icon: "⚡" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card rounded-xl p-5 text-center"
                  >
                    <p className="text-2xl mb-1">{stat.icon}</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* How it works */}
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">
                How it works
              </h3>
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                {[
                  {
                    step: "01",
                    title: "Post Your Property",
                    desc: "Fill in the details, upload photos, and go live in minutes — completely free.",
                    icon: "🏠",
                  },
                  {
                    step: "02",
                    title: "Get Direct Inquiries",
                    desc: "Tenants call or WhatsApp you directly. No middlemen, no commission cuts.",
                    icon: "📞",
                  },
                  {
                    step: "03",
                    title: "Manage with Ease",
                    desc: "Track, edit and remove listings anytime from your dashboard.",
                    icon: "📋",
                  },
                ].map((item) => (
                  <div key={item.step} className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {item.step}
                      </span>
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <h4 className="font-semibold text-white mb-1 text-sm">
                      {item.title}
                    </h4>
                    <p className="text-white/50 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-white font-semibold">
                    Ready to list your property?
                  </p>
                  <p className="text-white/40 text-sm">
                    It's free and takes less than 5 minutes.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/add-property")}
                  className="px-6 py-3 bg-emerald-500/80 backdrop-blur text-white text-sm font-medium rounded-xl hover:bg-emerald-500 transition whitespace-nowrap"
                >
                  Start Listing →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Stats */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Our Community
          </h2>
          <p className="text-white/50 text-center max-w-2xl mx-auto mb-10">
            Verified listings, direct landlord connections, and zero brokerage
            friction.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-center mb-8">
            {[
              {
                value: "5,000+",
                label: "Happy Tenants",
                icon: "😊",
                color: "text-emerald-400",
              },
              {
                value: "1,200+",
                label: "Properties Listed",
                icon: "🏠",
                color: "text-blue-400",
              },
              {
                value: "20+",
                label: "Cities Covered",
                icon: "📍",
                color: "text-purple-400",
              },
              {
                value: "15+",
                label: "New Listings Daily",
                icon: "📅",
                color: "text-yellow-400",
              },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6 rounded-2xl">
                <p className="text-3xl mb-2">{stat.icon}</p>
                <p className={`text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="glass-light rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-1">
                <p className="text-4xl text-emerald-400 font-serif leading-none mb-3">
                  "
                </p>
                <p className="text-white/70 text-lg leading-relaxed">
                  Found my apartment in Dhanmondi within 3 days. No broker, no
                  extra fees — just called the owner directly and moved in the
                  next week.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    R
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      Rahim Uddin
                    </p>
                    <p className="text-white/40 text-xs">Tenant, Dhanmondi</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden sm:block w-px bg-white/10 self-stretch" />
              <div className="flex sm:flex-col gap-4 sm:gap-6 sm:min-w-[140px]">
                {[
                  { value: "< 3 days", label: "Avg. time to find" },
                  { value: "0৳", label: "Brokerage fees" },
                  { value: "4.9 ★", label: "User rating" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-white font-bold text-lg">{item.value}</p>
                    <p className="text-white/40 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-light rounded-2xl p-10 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-3">
                Ready to Find Your Next Place?
              </h2>
              <p className="text-white/50 max-w-md mx-auto mb-8">
                Join thousands of tenants and landlords across Bangladesh who
                skip the broker entirely.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate("/listings")}
                  className="px-7 py-3 bg-emerald-500/80 backdrop-blur text-white font-medium rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20"
                >
                  Browse Properties
                </button>
                <button
                  onClick={() => navigate("/add-property")}
                  className="px-7 py-3 glass text-white font-medium rounded-xl hover:glass-light border border-white/10 transition"
                >
                  List Your Property
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
