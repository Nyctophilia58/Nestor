import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-light rounded-2xl w-full max-w-md p-8 shadow-2xl text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-white/50 text-sm mb-6">
            This password reset link is invalid or missing a token.
          </p>
          <Link
            to="/login"
            className="text-emerald-400 font-medium hover:underline text-sm"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-light rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="mb-8 text-center">
          {success ? (
            <>
              <div className="text-4xl mb-3">✅</div>
              <h1 className="text-2xl font-bold text-white">Password Reset!</h1>
              <p className="text-white/50 text-sm mt-1">
                Your password has been updated successfully.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block text-emerald-400 font-medium hover:underline text-sm"
              >
                ← Back to Login
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white">Reset Password</h1>
              <p className="text-white/50 text-sm mt-1">
                Enter your new password
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <Link
              to="/login"
              className="block text-center text-sm text-white/50 hover:text-white transition"
            >
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
