import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import api, { getErrorMessage } from "../lib/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const Profile = () => {
  const { user, token, setAuth } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? "");
  const [submitted, setSubmitted] = useState(false);

  const MAX_CHARS = 200;

  if (!user) return <Navigate to="/login" replace />;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      const res = await api.put("/auth/profile", { name, bio, avatar: avatarUrl });
      setAuth(res.data, token ?? "");
      toast.success("Profile updated!");
      setEditMode(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>

      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-24 h-24 text-emerald-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <label className="cursor-pointer px-4 py-2 bg-emerald-500/80 text-white rounded-lg hover:bg-emerald-500 transition">
              Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg glass text-white placeholder-white/30 ${
                submitted && !name ? 'ring-1 ring-red-400/50 focus:ring-red-400/50' : 'focus:ring-2 focus:ring-emerald-400/50'
              }`}
            />
            {submitted && !name && (
              <p className="text-red-400 text-xs mt-1">Name is required</p>
            )}
          </div>

          {/* Bio */}
          <textarea
            rows={4}
            value={bio}
            maxLength={MAX_CHARS}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 rounded-lg glass text-white placeholder-white/30 resize-none overflow-y-auto overflow-x-hidden break-words"
            style={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
          />

          <p className="mt-1 text-xs text-white/50">
            {bio.length}/{MAX_CHARS} characters
          </p>

          <div className="flex gap-4">
            <button type="submit" className="px-4 py-2 bg-emerald-500/80 text-white rounded-lg hover:bg-emerald-500 transition">
              Save
            </button>
            <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-500/30 text-white rounded-lg hover:bg-gray-500/50 transition">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-24 h-24 text-emerald-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <div>
              <p className="text-xl font-medium text-white">{user.name}</p>
              <p className="text-white/70">{user.email}</p>
            </div>
          </div>
          {user.bio && (
            <p className="text-white/80 whitespace-pre-line break-words">{user.bio}</p>
          )}
          <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-emerald-500/80 text-white rounded-lg hover:bg-emerald-500 transition">
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
