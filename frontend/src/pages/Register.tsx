import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import api, { getErrorMessage } from "../lib/api";

const Register = () => {
  const [method, setMethod] = useState<"email" | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setAuth(res.data.user, res.data.token);
      toast.success("Account created! Welcome to Nestor");
      navigate("/");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    }/auth/google?mode=register`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-light rounded-2xl w-full max-w-md p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            {method === "email" ? "Create Account" : "Join Nestor"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {method === "email" ? "Fill in your details" : "Get started today"}
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
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg transition backdrop-blur border border-white/10"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h10.19c-.44 2-2.2 3.74-4.69 3.74-2.83 0-5.14-2.08-5.14-5s2.31-5 5.14-5c1.42 0 2.71.58 3.61 1.5l3.18-3.18C17.45 2.94 14.86 2 12 2 6.48 2 1.88 5.92 0 11l4.15 2.76C5.22 10.12 8.15 7.36 12 7.36c4.55 0 7.36 3.87 7.36 7.64l.2.25z"
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
              Continue with Google
            </button>

            <div className="relative py-2">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-white/40">or</span>
              </div>
            </div>

            <button
              onClick={() => setMethod("email")}
              className="w-full py-3 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-lg transition font-medium backdrop-blur"
            >
              Register with Email
            </button>
          </div>
        ) : (
          /* Email Form */
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="01700000000"
                  className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <button
              onClick={() => setMethod(null)}
              className="w-full mt-4 text-sm text-white/50 hover:text-white transition"
            >
              ← Back to options
            </button>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
