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
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Home in Bangladesh
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Browse thousands of properties — no brokers, no hassle.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            {/* Rent / Sale Toggle */}
            <div className="flex gap-2 mb-4">
              {["rent", "sale"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    type === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t === "rent" ? "For Rent" : "For Sale"}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by location e.g. Dhanmondi, Dhaka"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { label: "Properties Listed", value: "1,200+" },
            { label: "Cities Covered", value: "20+" },
            { label: "Happy Tenants", value: "5,000+" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Apartments", icon: "🏢", category: "apartment" },
            { label: "Houses", icon: "🏠", category: "house" },
            { label: "Offices", icon: "🏛️", category: "office" },
          ].map((cat) => (
            <button
              key={cat.category}
              onClick={() => navigate(`/listings?category=${cat.category}`)}
              className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition text-left"
            >
              <span className="text-4xl">{cat.icon}</span>
              <div>
                <p className="font-semibold text-gray-800">{cat.label}</p>
                <p className="text-sm text-gray-500">
                  Browse {cat.label.toLowerCase()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 border-t border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Have a property to list?
            </h2>
            <p className="text-gray-500 mt-1">
              Post it for free and reach thousands of tenants.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-property")}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition whitespace-nowrap"
          >
            List Your Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
