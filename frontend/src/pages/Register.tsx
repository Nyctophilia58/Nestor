import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import api, { getErrorMessage } from "../lib/api";

interface GoogleData {
  google_id: string;
  name: string;
  email: string;
  avatar: string;
}

/** Parse Google OAuth data from URL params during initial render */
function getInitialGoogleData(): GoogleData | null {
  const params = new URLSearchParams(window.location.search);
  const googleId = params.get("google_id");
  const name = params.get("name");
  const email = params.get("email");
  if (googleId && name && email) {
    return {
      google_id: googleId,
      name: decodeURIComponent(name),
      email: decodeURIComponent(email),
      avatar: params.get("avatar") || "",
    };
  }
  return null;
}

/** Parse warning from URL params during initial render */
function getInitialWarning(): string {
  const params = new URLSearchParams(window.location.search);
  const err = params.get("error");
  if (err === "existing_account") {
    window.history.replaceState({}, "", "/register");
    return "You already have an account with this email. Please log in instead.";
  }
  return "";
}

const getPasswordStrength = (password: string) => {
  const rules = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]
  const score = rules.filter(r => r.met).length
  return { rules, score }
}

const isValidPhone = (phone: string) =>
  /^(?:\+?88)?01[3-9]\d{8}$/.test(phone)


const Register = () => {
  // Capture Google OAuth data from URL once, no setState inside effects
  // Capture Google OAuth data from URL params during initial render
  const [googleData] = useState<GoogleData | null>(getInitialGoogleData);

  const [method, setMethod] = useState<"email" | null>(
    googleData ? "email" : null,
  );
  const [form, setForm] = useState({
    name: googleData?.name || "",
    email: googleData?.email || "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [warning, setWarning] = useState(getInitialWarning);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const fromOAuth = !!googleData;

  // Auto-dismiss warning after 6 seconds when first shown
  useEffect(() => {
    if (!warning) return;
    const timer = setTimeout(() => setWarning(""), 6000);
    return () => clearTimeout(timer);
  }, [warning]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(''), 5000)
    return () => clearTimeout(timer)
  }, [error]);

  // Clean up OAuth params from the URL after capturing them
  useEffect(() => {
    if (googleData) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [googleData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-capitalize first letter of each word for name field
    if (name === 'name') {
      const capitalized = value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setForm({ ...form, [name]: capitalized });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setWarning("");
    setSubmitted(true);

    // Complete Google registration: create the user with phone + role
    if (fromOAuth && googleData) {
      setLoading(true);
      try {
        const res = await api.post("/auth/complete-google", {
          google_id: googleData.google_id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          avatar: googleData.avatar,
        });
        setAuth(res.data.user, res.data.token);
        toast.success("Account created! Welcome to Nestor");
        navigate("/");
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

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
        role: form.role,
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

        {/* Warning */}
        {warning && (
          <div className="mb-4 p-3 bg-amber-500/15 border border-amber-400/30 text-amber-200 text-sm rounded-lg flex items-start gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 8h.01M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{warning}</span>
          </div>
        )}
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
              onClick={() => {
                setMethod("email");
                setWarning("");
                setError("");
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  confirmPassword: "",
                  role: "",
                });
              }}
              className="w-full py-3 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-lg transition font-medium backdrop-blur"
            >
              Register with Email
            </button>
          </div>
        ) : fromOAuth ? (
          /* Google OAuth — Complete profile with phone + role */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — from Google, read-only */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                disabled
                className="w-full px-4 py-2.5 glass rounded-lg text-white/60 text-sm cursor-not-allowed"
              />
            </div>

            {/* Email — from Google, read-only */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                className="w-full px-4 py-2.5 glass rounded-lg text-white/60 text-sm cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01700000000"
                required
                disabled={loading}
                className={`w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 ${
                  form.phone && !isValidPhone(form.phone)
                    ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                    : 'focus:ring-emerald-400/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {form.phone && !isValidPhone(form.phone) && (
                <p className="text-red-400 text-xs mt-1">Enter a valid number (e.g. 01712345678 or +8801712345678)</p>
              )}
              {form.phone && isValidPhone(form.phone) && (
                <p className="text-green-400 text-xs mt-1">Valid phone number</p>
              )}
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                I am a <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "tenant",
                    label: "🔍 Tenant",
                    desc: "Looking for a property",
                  },
                  {
                    value: "landlord",
                    label: "🏠 Landlord",
                    desc: "Listing a property",
                  },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3 rounded-xl border text-left transition ${
                      form.role === r.value
                        ? "border-emerald-400 bg-emerald-500/15"
                        : "glass border-white/10 hover:border-white/20"
                    }`}
                  >
                    <p className="text-white text-sm font-medium">{r.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info box about roles */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-300/80 leading-relaxed">
              💡 <strong>Not sure?</strong> A <strong>Tenant</strong> looks for
              a property to rent, while a <strong>Landlord</strong> lists
              properties for rent or sale.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Complete Profile"}
            </button>
          </form>
        ) : (
          /* Email Registration — Full form */
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 ${
                    submitted && !form.name
                      ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                      : 'focus:ring-emerald-400/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 ${
                  form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
                    ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                    : 'focus:ring-emerald-400/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                  <p className="text-red-400 text-xs mt-1">Enter a valid email address</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="01700000000"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 ${
                    form.phone && !isValidPhone(form.phone)
                      ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                      : 'focus:ring-emerald-400/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />

                {form.phone && !isValidPhone(form.phone) && (
                  <p className="text-red-400 text-xs mt-1">
                    Enter a valid number (e.g. 01712345678 or +8801712345678)
                  </p>
                )}
                {form.phone && isValidPhone(form.phone) && (
                  <p className="text-emerald-400 text-xs mt-1">✓ Valid phone number</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  I am a <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "tenant",
                      label: "🔍 Tenant",
                      desc: "Looking for a property",
                    },
                    {
                      value: "landlord",
                      label: "🏠 Landlord",
                      desc: "Listing a property",
                    },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`p-3 rounded-xl border text-left transition ${
                        form.role === r.value
                          ? "border-emerald-400 bg-emerald-500/15"
                          : "glass border-white/10 hover:border-white/20"
                      }`}
                    >
                      <p className="text-white text-sm font-medium">
                        {r.label}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info box about roles */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-300/80 leading-relaxed">
                💡 <strong>Not sure?</strong> A <strong>Tenant</strong> looks
                for a property to rent, while a <strong>Landlord</strong> lists
                properties for rent or sale.
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className={`w-full px-4 py-2.5 pr-10 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 ${
                      submitted && !form.password
                        ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                        : form.password && getPasswordStrength(form.password).score < 5
                          ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                          : 'focus:ring-emerald-400/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Password strength */}
                {form.password && (() => {
                  const { rules, score } = getPasswordStrength(form.password)
                  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score]
                  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-400'][score]

                  return (
                    <div className="mt-2 space-y-2">
                      {/* Strength bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                i < score ? strengthColor : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs font-medium ${
                          score <= 1 ? 'text-red-400' :
                          score === 2 ? 'text-orange-400' :
                          score === 3 ? 'text-yellow-400' :
                          'text-emerald-400'
                        }`}>
                          {strengthLabel}
                        </span>
                      </div>

                      {/* Rules checklist */}
                      <div className="grid grid-cols-2 gap-1">
                        {rules.map((rule) => (
                          <p key={rule.label} className={`text-xs flex items-center gap-1 ${
                            rule.met ? 'text-emerald-400' : 'text-white/30'
                          }`}>
                            {rule.met ? '✓' : '○'} {rule.label}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className={`w-full px-4 py-2.5 pr-10 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 ${
                      submitted && !form.confirmPassword || (form.confirmPassword && form.confirmPassword !== form.password)
                        ? 'focus:ring-red-400/50 ring-1 ring-red-400/30'
                        : 'focus:ring-emerald-400/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80 transition"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
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
              onClick={() => {
                setMethod(null);
                setWarning("");
                setError("");
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  confirmPassword: "",
                  role: "",
                });
              }}
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
