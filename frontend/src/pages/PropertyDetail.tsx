import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { type Property } from "../types";
import { useAuthStore } from "../store/authStore";
import FavouriteButton from "../components/FavouriteButton";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorState from "../components/ErrorState";
import ImageCarousel from "../components/ImageCarousel";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data);
        setFetchError("");
      } catch (err: unknown) {
        setFetchError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/properties/${id}`);
      toast.success("Property deleted");
      navigate("/listings");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      console.error(err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-80 glass rounded-2xl mb-6" />
        <div className="h-6 glass rounded w-1/2 mb-4" />
        <div className="h-4 glass rounded w-1/3" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <ErrorState
          message={fetchError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center py-20 text-white/30">
          <p className="text-5xl mb-4">🏚️</p>
          <p className="text-lg font-medium">Property not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Images */}
      <ImageCarousel images={property.images || []} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left — Details */}
        <div className="md:col-span-2">
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium backdrop-blur ${
                property.type === "rent"
                  ? "bg-green-500/20 text-green-300 border border-green-400/30"
                  : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
              }`}
            >
              {property.type === "rent" ? "For Rent" : "For Sale"}
            </span>
            <span className="text-xs px-3 py-1 rounded-full glass text-white/70 capitalize">
              {property.category}
            </span>
          </div>

          {/* Title & Location */}
          <h1 className="text-2xl font-bold text-white mb-2">
            {property.title}
          </h1>
          <p className="text-white/50 mb-4">📍 {property.location}</p>

          {/* Save Button */}
          <div className="flex items-center gap-3 mb-6">
            <FavouriteButton propertyId={property.id} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Bedrooms", value: property.bedrooms, icon: "🛏" },
              { label: "Bathrooms", value: property.bathrooms, icon: "🚿" },
              { label: "Area (sqft)", value: property.area, icon: "📐" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-xl p-4 text-center"
              >
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-lg font-bold text-white">
                  {stat.value ?? "—"}
                </p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Description
            </h2>
            <p className="text-white/60 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Owner Actions */}
          {user && user.id === property.user_id && (
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-500/15 text-red-400 border border-red-400/30 text-sm font-medium rounded-lg hover:bg-red-500/25 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Property"}
              </button>
            </div>
          )}
        </div>

        {/* Right — Price & Contact */}
        <div>
          <div className="glass-light rounded-2xl p-6 sticky top-24">
            {/* Price */}
            <p className="text-3xl font-bold text-blue-400 mb-1">
              ৳{property.price.toLocaleString()}
              {property.type === "rent" && (
                <span className="text-white/40 font-normal text-sm">
                  /month
                </span>
              )}
            </p>

            <p className="text-sm text-white/40 mb-6">
              Listed on {new Date(property.created_at).toLocaleDateString()}
            </p>

            {/* Owner Info */}
            <div className="border-t border-white/10 pt-4 mb-4">
              <p className="text-sm text-white/40 mb-1">Listed by</p>
              <p className="font-semibold text-white">{property.owner_name}</p>
              {property.owner_phone && (
                <p className="text-sm text-white/50 mt-1">
                  📞 {property.owner_phone}
                </p>
              )}
            </div>

            {/* Contact Button */}
            {property.owner_phone && (
              <a
                href={`tel:${property.owner_phone}`}
                className="block w-full text-center py-3 bg-blue-500/80 backdrop-blur text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition"
              >
                Call Owner
              </a>
            )}

            {/* WhatsApp Button */}
            {property.owner_phone && (
              <a
                href={`https://wa.me/${property.owner_phone}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-3 mt-2 bg-green-500/80 backdrop-blur text-white text-sm font-medium rounded-xl hover:bg-green-500 transition"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Property?"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default PropertyDetail;
