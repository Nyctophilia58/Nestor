import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("rent");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/listings?location=${search}&type=${type}`);
  };

  return (
    <div>
      {/* Hero */}
      <div className="py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect
            <span className="text-blue-400"> Home</span>
          </h1>
          <p className="text-white/60 text-lg mb-12">
            Browse thousands of properties — no brokers, no hassle.
          </p>

          {/* Search Box */}
          <div className="glass-light rounded-2xl p-5 shadow-2xl">
            <div className="flex gap-2 mb-4">
              {["rent", "sale"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    type === t
                      ? "bg-blue-500 text-white"
                      : "glass text-white/70 hover:text-white"
                  }`}
                >
                  {t === "rent" ? "For Rent" : "For Sale"}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by location e.g. Dhanmondi, Dhaka"
                className="flex-1 px-4 py-3 rounded-lg glass text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-500/90 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition backdrop-blur"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Properties Listed", value: "1,200+" },
            { label: "Cities Covered", value: "20+" },
            { label: "Happy Tenants", value: "5,000+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
              <p className="text-sm text-white/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Apartments",
              icon: "🏢",
              category: "apartment",
              desc: "Browse apartments",
            },
            {
              label: "Houses",
              icon: "🏠",
              category: "house",
              desc: "Browse houses",
            },
            {
              label: "Offices",
              icon: "🏛️",
              category: "office",
              desc: "Browse offices",
            },
          ].map((cat) => (
            <button
              key={cat.category}
              onClick={() => navigate(`/listings?category=${cat.category}`)}
              className="glass-card rounded-2xl p-6 flex items-center gap-4 text-left"
            >
              <span className="text-4xl">{cat.icon}</span>
              <div>
                <p className="font-semibold text-white">{cat.label}</p>
                <p className="text-sm text-white/50">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="glass-light rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Have a property to list?
            </h2>
            <p className="text-white/50 mt-1">
              Post it for free and reach thousands of tenants.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-property")}
            className="px-8 py-3 bg-blue-500/80 backdrop-blur text-white font-medium rounded-xl hover:bg-blue-500 transition whitespace-nowrap"
          >
            List Your Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
