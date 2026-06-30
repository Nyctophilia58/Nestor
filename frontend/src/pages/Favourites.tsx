import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../lib/api";
import { type Property } from "../types";
import { useAuthStore } from "../store/authStore";
import ErrorState from "../components/ErrorState";

const Favourites = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/properties/favourites")
      .then((res) => setProperties(res.data))
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Saved Properties</h1>

      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl text-white/30 border border-dashed border-white/10">
          <p className="text-5xl mb-4">🤍</p>
          <p className="font-medium text-white/50">No saved properties yet</p>
          <Link
            to="/listings"
            className="inline-block mt-4 px-5 py-2 bg-blue-500/80 backdrop-blur text-white text-sm rounded-lg hover:bg-blue-500 transition"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              to={`/listings/${property.id}`}
              key={property.id}
              className="glass-card rounded-2xl overflow-hidden group"
            >
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
                <h3 className="font-semibold text-white truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-white/50 truncate mb-2">
                  📍 {property.location}
                </p>
                <p className="text-blue-400 font-bold">
                  ৳{property.price.toLocaleString()}
                  {property.type === "rent" && (
                    <span className="text-white/30 font-normal text-xs">
                      /mo
                    </span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
