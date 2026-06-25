import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { type Property } from "../types";
import { useAuthStore } from "../store/authStore";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    setDeleting(true);
    try {
      await api.delete(`/properties/${id}`);
      navigate("/listings");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-80 bg-gray-100 rounded-2xl mb-6" />
        <div className="h-6 bg-gray-100 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">🏚️</p>
        <p className="text-lg font-medium">Property not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Images */}
      <div className="mb-8">
        <div className="h-80 bg-gray-100 rounded-2xl overflow-hidden mb-3">
          {property.images?.[activeImage] ? (
            <img
              src={property.images[activeImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
              🏠
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {property.images?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {property.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${
                  activeImage === i ? "border-blue-500" : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left — Details */}
        <div className="md:col-span-2">
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                property.type === "rent"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {property.type === "rent" ? "For Rent" : "For Sale"}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
              {property.category}
            </span>
          </div>

          {/* Title & Location */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {property.title}
          </h1>
          <p className="text-gray-500 mb-6">📍 {property.location}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Bedrooms", value: property.bedrooms, icon: "🛏" },
              { label: "Bathrooms", value: property.bathrooms, icon: "🚿" },
              { label: "Area (sqft)", value: property.area, icon: "📐" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"
              >
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-lg font-bold text-gray-800">
                  {stat.value ?? "—"}
                </p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Owner Actions */}
          {user && user.id === property.user_id && (
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Property"}
              </button>
            </div>
          )}
        </div>

        {/* Right — Price & Contact */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
            {/* Price */}
            <p className="text-3xl font-bold text-blue-600 mb-1">
              ৳{property.price.toLocaleString()}
              {property.type === "rent" && (
                <span className="text-gray-400 font-normal text-sm">
                  /month
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Listed on {new Date(property.created_at).toLocaleDateString()}
            </p>

            {/* Owner Info */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Listed by</p>
              <p className="font-semibold text-gray-800">
                {property.owner_name}
              </p>
              {property.owner_phone && (
                <p className="text-sm text-gray-500 mt-1">
                  📞 {property.owner_phone}
                </p>
              )}
            </div>

            {/* Contact Button */}
            {property.owner_phone && (
              <a
                href={`tel:${property.owner_phone}`}
                className="block w-full text-center py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
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
                className="block w-full text-center py-3 mt-2 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
