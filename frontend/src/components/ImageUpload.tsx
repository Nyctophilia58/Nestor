import { useState } from "react";
import api from "../lib/api";

interface Props {
  onUpload: (urls: string[]) => void;
}

const ImageUpload = ({ onUpload }: Props) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const localPreviews = Array.from(files).map((file) =>
      URL.createObjectURL(file),
    );
    setPreviews(localPreviews);
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpload(res.data.urls);
    } catch (err) {
      setError("Upload failed. Please try again." + (err as string));
      setPreviews([]);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onUpload([]);
  };

  return (
    <div>
      <label className="flex flex-col items-center justify-center w-full h-36 glass rounded-xl cursor-pointer hover:glass-light transition">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFiles}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-blue-300">Uploading...</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-3xl mb-2">📸</p>
            <p className="text-sm text-white/60">Click to upload images</p>
            <p className="text-xs text-white/30 mt-1">
              JPG, PNG, WEBP — max 5MB each — up to 5 images
            </p>
          </div>
        )}
      </label>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      {previews.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden glass"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 bg-red-500/90 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
