import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { type Property } from "../types";
import { useAuthStore } from "../store/authStore";

const Favourites = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/properties/favourites")
      .then((res) => setProperties(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Saved Properties
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl text-gray-400">
          <p className="text-5xl mb-4">🤍</p>
          <p className="font-medium">No saved properties yet</p>
          <Link
            to="/listings"
            className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
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
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition group"
            >
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
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-500 truncate mb-2">
                  📍 {property.location}
                </p>
                <p className="text-blue-600 font-bold">
                  ৳{property.price.toLocaleString()}
                  {property.type === "rent" && (
                    <span className="text-gray-400 font-normal text-xs">
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
