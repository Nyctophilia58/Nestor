import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useFavouriteStore } from "../store/favouriteStore";

interface Props {
  propertyId: number;
}

const FavouriteButton = ({ propertyId }: Props) => {
  const { user } = useAuthStore();
  const { ids, add, remove } = useFavouriteStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isFavourited = ids.includes(propertyId);

  const handleToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      if (isFavourited) {
        await api.delete(`/properties/${propertyId}/favourite`);
        remove(propertyId);
      } else {
        await api.post(`/properties/${propertyId}/favourite`);
        add(propertyId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur transition disabled:opacity-50 ${
        isFavourited
          ? "bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30"
          : "glass text-white/60 hover:glass-light hover:text-white"
      }`}
    >
      {isFavourited ? "❤️" : "🤍"}
      {isFavourited ? "Saved" : "Save"}
    </button>
  );
};

export default FavouriteButton;
