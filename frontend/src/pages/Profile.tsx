import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
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

  // Stats state
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [propertiesCount, setPropertiesCount] = useState(0);

  // Email verification state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const MAX_CHARS = 200;

  if (!user) return <Navigate to="/login" replace />;

  // Fetch stats on mount
  useEffect(() => {
    // Get favorites count
    api.get("/properties/favourites")
      .then((res) => setFavoritesCount(res.data?.length ?? 0))
      .catch(() => setFavoritesCount(0));

    // Get properties count (for landlords)
    if (user.role === "landlord") {
      api.get("/properties/mine")
        .then((res) => setPropertiesCount(res.data?.length ?? 0))
        .catch(() => setPropertiesCount(0));
    }
  }, [user.role]);

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

  // Email verification handlers
  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await api.post("/auth/send-verification-otp");
      toast.success(res.data.message || "Verification code sent!");
      setShowOtpInput(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await api.post("/auth/verify-email-otp", { otp });
      // Update the user in auth store with verified status
      if (res.data.user) {
        setAuth(res.data.user, token ?? "");
      }
      toast.success(res.data.message || "Email verified!");
      setShowOtpInput(false);
      setOtp("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Helper to get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-300 border-purple-400/30";
      case "landlord":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "👑";
      case "landlord":
        return "🏠";
      default:
        return "🔍";
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
        <div className="space-y-6">
          {/* Profile Card */}
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
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xl font-medium text-white">{user.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getRoleBadgeColor(user.role)}`}>
                    {getRoleIcon(user.role)} {user.role}
                  </span>
                  {user.email_verified ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      ✓ Email verified
                    </span>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition disabled:opacity-50"
                    >
                      {sendingOtp ? "Sending..." : "📧 Verify Email"}
                    </button>
                  )}
                </div>
                <p className="text-white/70 flex items-center gap-1">
                  {user.email}
                </p>
                {user.phone && <p className="text-white/50 text-sm">📞 {user.phone}</p>}
                {user.created_at && (
                  <p className="text-white/40 text-xs mt-1">
                    Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
            {user.bio && (
              <p className="text-white/80 whitespace-pre-line break-words">{user.bio}</p>
            )}
            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-emerald-500/80 text-white rounded-lg hover:bg-emerald-500 transition">
              Edit Profile
            </button>
          </div>

          {/* OTP Verification Section */}
          {showOtpInput && (
            <div className="glass-card rounded-2xl p-6 border border-amber-400/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📧</span> Verify your email
              </h3>
              <p className="text-white/60 text-sm mb-4">
                We sent a 6-digit code to <strong className="text-white">{user.email}</strong>. Check your inbox and enter the code below.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-lg glass text-white text-center text-2xl tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={verifyingOtp || otp.length !== 6}
                    className="flex-1 px-4 py-2 bg-emerald-500/80 text-white rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp("");
                    }}
                    className="px-4 py-2 bg-gray-500/30 text-white rounded-lg hover:bg-gray-500/50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              <p className="text-white/40 text-xs mt-3 text-center">
                Code expires in 10 minutes
              </p>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Role Stat */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <p className="text-white/50 text-sm">Role</p>
                  <p className="text-white font-semibold capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Favorites Stat */}
            <Link to="/favourites" className="glass-card rounded-xl p-5 hover:bg-white/5 transition">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-2xl">
                  ❤️
                </div>
                <div>
                  <p className="text-white/50 text-sm">Saved Properties</p>
                  <p className="text-white font-semibold">{favoritesCount}</p>
                </div>
              </div>
            </Link>

            {/* Properties Listed (Landlord only) */}
            {user.role === "landlord" && (
              <Link to="/dashboard" className="glass-card rounded-xl p-5 hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                    🏠
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">My Properties</p>
                    <p className="text-white font-semibold">{propertiesCount}</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;