import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { type Property } from "../types";
import { useAuthStore } from "../store/authStore";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorState from "../components/ErrorState";

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const res = await api.get("/properties/mine");
        setProperties(res.data);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProperties();
  }, []);

  // Redirect if not logged in
  if (!user) return <Navigate to="/login" replace />;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await api.delete(`/properties/${deleteId}`);
      setProperties((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
      toast.success("Property deleted");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
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
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/add-property"
            className="px-4 py-2 bg-blue-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition"
          >
            + Add Property
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 glass text-white/70 text-sm font-medium rounded-lg hover:glass-light hover:text-white transition"
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
            className="glass-card rounded-2xl p-6 text-center"
          >
            <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
            <p className="text-sm text-white/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 glass rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl text-white/30 border border-dashed border-white/10">
          <p className="text-5xl mb-4">🏠</p>
          <p className="font-medium text-white/50">No listings yet</p>
          <Link
            to="/add-property"
            className="inline-block mt-4 px-5 py-2 bg-blue-500/80 backdrop-blur text-white text-sm rounded-lg hover:bg-blue-500 transition"
          >
            Post your first property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="glass-card rounded-2xl p-4 flex items-center gap-4 flex-wrap md:flex-nowrap"
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/20 flex-shrink-0">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-white/20">
                    🏠
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-white/50 truncate">
                  📍 {property.location}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur ${
                      property.type === "rent"
                        ? "bg-green-500/20 text-green-300 border border-green-400/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                    }`}
                  >
                    {property.type === "rent" ? "For Rent" : "For Sale"}
                  </span>
                  <span className="text-xs text-white/40 capitalize">
                    {property.category}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-blue-400">
                  ৳{property.price.toLocaleString()}
                </p>
                <p className="text-xs text-white/30">
                  {property.type === "rent" ? "/month" : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link
                  to={`/listings/${property.id}`}
                  className="px-3 py-1.5 text-xs glass text-white/70 rounded-lg hover:glass-light hover:text-white transition text-center"
                >
                  View
                </Link>
                <button
                  onClick={() => setDeleteId(property.id)}
                  className="px-3 py-1.5 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        message="Delete this property? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Dashboard;
