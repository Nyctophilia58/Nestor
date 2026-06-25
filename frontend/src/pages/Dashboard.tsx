import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { type Property } from "../types";
import { useAuthStore } from "../store/authStore";

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const res = await api.get("/properties/mine");
        setProperties(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProperties();
  }, []);

  // Redirect if not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this property?")) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/add-property"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            + Add Property
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Listings", value: properties.length },
          {
            label: "For Rent",
            value: properties.filter((p) => p.type === "rent").length,
          },
          {
            label: "For Sale",
            value: properties.filter((p) => p.type === "sale").length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-6 text-center"
          >
            <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* My Listings */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">My Listings</h2>

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
          <p className="text-5xl mb-4">🏠</p>
          <p className="font-medium">No listings yet</p>
          <Link
            to="/add-property"
            className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Post your first property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4"
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
                    🏠
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  📍 {property.location}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      property.type === "rent"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {property.type === "rent" ? "For Rent" : "For Sale"}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {property.category}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-blue-600">
                  ৳{property.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  {property.type === "rent" ? "/month" : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link
                  to={`/listings/${property.id}`}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-center"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
