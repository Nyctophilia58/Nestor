import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";

const Register = () => {
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
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-light rounded-2xl w-full max-w-md p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-white/50 text-sm mt-1">Join Nestor today</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-400/30 text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
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
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
              className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
