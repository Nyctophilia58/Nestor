import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "../lib/api";
import { type Property } from "../types";
import ErrorState from "../components/ErrorState";

const Listings = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const LIMIT = 9;

  const fetchProperties = async (pageNum = 1) => {
    setLoading(true);
    setPage(pageNum);
    try {
      const res = await api.get("/properties", {
        params: {
          location,
          type,
          category,
          minPrice,
          maxPrice,
          page: pageNum,
          limit: LIMIT,
        },
      });
      setProperties(res.data.properties);
      setTotalPages(res.data.totalPages);
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      try {
        const res = await api.get("/properties", {
          params: {
            location,
            type,
            category,
            minPrice,
            maxPrice,
            page: 1,
            limit: LIMIT,
          },
        });
        setProperties(res.data.properties);
        setTotalPages(res.data.totalPages);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initialFetch();
  }, []);

  const handleFilter = () => {
    fetchProperties(1);
  };

  const handleReset = () => {
    setLocation("");
    setType("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
    fetchProperties(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Browse Properties</h1>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-8 flex flex-wrap gap-3">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="px-4 py-2 glass rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 bg-transparent [&>option]:bg-gray-800"
        >
          <option value="">All Types</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 bg-transparent [&>option]:bg-gray-800"
        >
          <option value="">All Categories</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="office">Office</option>
        </select>

        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min Price"
          className="px-4 glass rounded-lg text-white placeholder-white/40 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        />

        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max Price"
          className="px-4 glass rounded-lg text-white placeholder-white/40 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        />

        <button
          onClick={handleFilter}
          className="px-5 py-2 bg-blue-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition"
        >
          Search
        </button>

        <button
          onClick={handleReset}
          className="px-5 py-2 glass text-white/70 text-sm font-medium rounded-lg hover:glass-light transition"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {error && !loading ? (
        <ErrorState message={error} onRetry={fetchProperties} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-5xl mb-4">🏠</p>
          <p className="text-lg font-medium">No properties found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              to={`/listings/${property.id}`}
              key={property.id}
              className="glass-card rounded-2xl overflow-hidden group"
            >
              {/* Image */}
              <div className="h-48 bg-black/20 overflow-hidden">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-white/20">
                    🏠
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium backdrop-blur ${
                      property.type === "rent"
                        ? "bg-green-500/20 text-green-300 border border-green-400/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                    }`}
                  >
                    {property.type === "rent" ? "For Rent" : "For Sale"}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full glass text-white/60 capitalize">
                    {property.category}
                  </span>
                </div>

                <h3 className="font-semibold text-white mb-1 truncate">
                  {property.title}
                </h3>

                <p className="text-sm text-white/50 mb-3 truncate">
                  📍 {property.location}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-blue-400 font-bold">
                    ৳{property.price.toLocaleString()}
                    {property.type === "rent" && (
                      <span className="text-white/30 font-normal text-xs">
                        /mo
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3 text-xs text-white/40">
                    {property.bedrooms && <span>🛏 {property.bedrooms}</span>}
                    {property.bathrooms && <span>🚿 {property.bathrooms}</span>}
                    {property.area && <span>📐 {property.area} sqft</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && !error && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => fetchProperties(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 glass text-white/70 text-sm rounded-lg hover:glass-light hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first, last, and 2 pages around current
              return p === 1 || p === totalPages || Math.abs(p - page) <= 2;
            })
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center">
                {/* Ellipsis if there's a gap */}
                {idx > 0 && p - arr[idx - 1] > 1 && (
                  <span className="px-2 text-white/30">…</span>
                )}
                <button
                  onClick={() => fetchProperties(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? "bg-blue-500/80 text-white"
                      : "glass text-white/70 hover:glass-light hover:text-white"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}

          <button
            onClick={() => fetchProperties(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 glass text-white/70 text-sm rounded-lg hover:glass-light hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Listings;
