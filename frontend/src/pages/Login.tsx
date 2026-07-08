import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import api, { getErrorMessage } from "../lib/api";

const Login = () => {
  const [method, setMethod] = useState<"email" | "forgot" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-dismiss error after 6 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 6000);
    return () => clearTimeout(timer);
  }, [error]);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Read error from URL (e.g. ?error=google_auth_failed after failed Google login)
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_auth_failed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(
        "No account found with this Google account. Please register first.",
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      setAuth(res.data.user, res.data.token);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotLoading(true);
    console.log("[Forgot Password] Submitting...", { email: forgotEmail });
    try {
      const response = await api.post("/auth/forgot-password", {
        email: forgotEmail,
      });
      console.log("[Forgot Password] Success:", response.data);
      setForgotSent(true);
    } catch (err: unknown) {
      console.error("[Forgot Password] Error:", err);
      setError(getErrorMessage(err));
    } finally {
      console.log("[Forgot Password] Setting loading to false");
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    }/auth/google?mode=login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-light rounded-2xl w-full max-w-md p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            {method === "forgot"
              ? "Reset Password"
              : method === "email"
                ? "Login With Email"
                : "Login To Your Account"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {method === "forgot"
              ? "We'll send you a reset link"
              : method === "email"
                ? "Enter your credentials"
                : "Welcome back to "}
            {method === null && (
              <b>
                <span className="text-emerald-400">Nestor</span>
              </b>
            )}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        {!method ? (
          /* Choose Method */
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg transition backdrop-blur border border-white/10"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h10.19c-.44 2-2.2 3.74-4.69 3.74-2.83 0-5.14-2.08-5.14-5s2.31-5 5.14-5c1.42 0 2.71.58 3.61 1.5l3.18-3.18C17.45 2.94 14.86 2 12 2 6.48 2 1.88 5.92 0 11l4.15 2.76C5.22 10.12 8.15 7.36 12 7.36c4.55 0 7.36 3.87 7.36 7.64l.2.25zM22.56 12.26l.14-.04-.14.04z"
                  fill="#4285F4"
                />
                <path
                  d="M12 7.36c2.86 0 5.21 2.06 5.88 4.72h6.08c-.84-5.02-5.02-8.82-10.44-8.82-3.14 0-5.96 1.4-7.85 3.64l3.94 3.2c.95-1.84 2.86-3.06 5.39-3.06z"
                  fill="#EA4335"
                />
                <path
                  d="M12 22c2.86 0 5.45-.94 7.46-2.52l-3.91-2.89c-.9.86-2.14 1.39-3.55 1.39-2.91 0-5.15-1.93-6.01-4.61l-4.13 1.86C3.35 19.71 7.5 22 12 22z"
                  fill="#34A853"
                />
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25l.2-.01H12v4.26h5.77c-.37 1.33-1.31 2.45-2.57 3.2l3.56 3.32c2.15-2.03 3.23-5.02 3.23-8.27z"
                  fill="#FBBC05"
                />
              </svg>
              Login with Google
            </button>

            <div className="relative py-2">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-white/40"> or </span>
              </div>
            </div>

            <button
              onClick={() => {
                setMethod("email");
                setError("");
                setForgotSent(false);
                setForgotEmail("");
              }}
              className="w-full py-3 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-lg transition font-medium backdrop-blur"
            >
              Login with Email
            </button>
          </div>
        ) : method === "forgot" ? (
          /* Forgot Password Form */
          <>
            {forgotSent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">📧</div>
                <p className="text-white/80 text-sm">
                  If an account with <strong>{forgotEmail}</strong> exists, a
                  password reset link has been sent. Please check your inbox.
                </p>
                <button
                  onClick={() => {
                    setMethod(null);
                    setForgotSent(false);
                    setForgotEmail("");
                    setError("");
                  }}
                  className="mt-6 text-sm text-emerald-400 hover:underline"
                >
                  ← Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-emerald-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod("email");
                    setForgotSent(false);
                    setForgotEmail("");
                    setError("");
                  }}
                  className="w-full text-sm text-white/50 hover:text-white transition"
                >
                  ← Back to login
                </button>
              </form>
            )}
          </>
        ) : (
          /* Email Login Form */
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("forgot");
                    setError("");
                    setPassword("");
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <button
              onClick={() => {
                setMethod(null);
                setError("");
                setEmail("");
                setPassword("");
              }}
              className="w-full mt-4 text-sm text-white/50 hover:text-white transition"
            >
              ← Back to options
            </button>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-400 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
