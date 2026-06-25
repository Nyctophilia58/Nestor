import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../lib/api";
import { type Property } from "../types";

const Listings = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get("/properties", {
        params: { location, type, category, minPrice, maxPrice },
      });
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const res = await api.get("/properties", {
          params: { location: "", type: "", category: "" },
        });
        setProperties(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  const handleFilter = () => {
    fetchProperties();
  };

  const handleReset = () => {
    setLocation("");
    setType("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
    fetchProperties();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Browse Properties
      </h1>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 flex flex-wrap gap-3">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max Price"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleFilter}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>

        <button
          onClick={handleReset}
          className="px-5 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-64 animate-pulse"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
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
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition group"
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                    🏠
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      property.type === "rent"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {property.type === "rent" ? "For Rent" : "For Sale"}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                    {property.category}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-800 mb-1 truncate">
                  {property.title}
                </h3>

                <p className="text-sm text-gray-500 mb-3 truncate">
                  📍 {property.location}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-blue-600 font-bold">
                    ৳{property.price.toLocaleString()}
                    {property.type === "rent" && (
                      <span className="text-gray-400 font-normal text-xs">
                        /mo
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-500">
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
    </div>
  );
};

export default Listings;
