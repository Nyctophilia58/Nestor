import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import ImageUpload from "../components/ImageUpload";

const AddProperty = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    type: "rent",
    category: "apartment",
    location: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    images: [] as string[],
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user || (user.role !== "landlord" && user.role !== "admin")) {
    navigate("/");
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (urls: string[]) => {
    setForm((prev) => ({ ...prev, images: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
      };

      const res = await api.post("/properties", payload);
      toast.success("Property listed successfully!");
      navigate(`/listings/${res.data.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="glass-light rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">List a Property</h1>
        <p className="text-white/50 text-sm mb-8">
          Fill in the details below to post your property.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Spacious 3 Bed Apartment in Dhanmondi"
              required
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 bg-transparent [&>option]:bg-gray-800"
              >
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 bg-transparent [&>option]:bg-gray-800"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="office">Office</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Dhanmondi, Dhaka"
              required
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>

          {/* Price & Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Price (৳){" "}
                {form.type === "rent" && (
                  <span className="text-white/30">/month</span>
                )}
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="25000"
                required
                className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Area (sqft)
              </label>
              <input
                type="number"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="1200"
                className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                value={form.bedrooms}
                onChange={handleChange}
                placeholder="3"
                className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={form.bathrooms}
                onChange={handleChange}
                placeholder="2"
                className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the property — features, nearby places, condition..."
              rows={4}
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Photos
            </label>
            <ImageUpload onUpload={handleImageUpload} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500/80 backdrop-blur text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Property"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
