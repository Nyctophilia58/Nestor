import { useState } from "react";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import Footer from "../components/Footer";

const faqs = [
  {
    category: "Listings",
    questions: [
      {
        q: "How do I post a property?",
        a: 'Click "List Your Property" in the navbar or dashboard. Fill in the property details, upload photos, and submit. Your listing goes live immediately.',
      },
      {
        q: "How do I delete a listing?",
        a: "Go to your Dashboard, find the property, and click the Delete button. You can also delete from the property detail page if you are the owner.",
      },
      {
        q: "Can I edit a listing after posting?",
        a: "Editing is coming soon. For now, delete and repost the listing with updated details.",
      },
      {
        q: "Why was my listing removed?",
        a: "Listings may be removed if they violate our Terms of Service — for example, duplicate listings, fake information, or unavailable properties.",
      },
    ],
  },
  {
    category: "Account",
    questions: [
      {
        q: "How do I reset my password?",
        a: "Password reset via email is coming soon. For now, contact us at nowtechdev@gmail.com with your registered email and we will help you.",
      },
      {
        q: "How do I update my profile?",
        a: "Profile editing is coming soon. Contact us if you need to update your name, email, or phone number urgently.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Email us at nowtechdev@gmail.com from your registered email address and we will delete your account and all associated data within 7 days.",
      },
    ],
  },
  {
    category: "Properties",
    questions: [
      {
        q: "How do I contact a property owner?",
        a: "Open any property listing and you will see the owner's phone number. You can call them directly or tap the WhatsApp button.",
      },
      {
        q: "Are listings verified?",
        a: "We review listings before they go live to check for duplicates and obvious fake information. However, always view a property in person before making any payment.",
      },
      {
        q: "How do I save a property?",
        a: 'Click the "Save" button on any property detail page. Find all your saved properties under the Saved section in the navbar.',
      },
    ],
  },
  {
    category: "Payments & Fees",
    questions: [
      {
        q: "Does Nestor charge any fees?",
        a: "No. Nestor is completely free to use for both landlords and tenants. We charge zero commission on any transaction.",
      },
      {
        q: "Does Nestor handle payments?",
        a: "No. All payments are arranged directly between landlord and tenant. Nestor is purely a listing platform — we are not involved in any financial transaction.",
      },
    ],
  },
];

const HelpCenter = () => {
  const { user } = useAuthStore();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Listings");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    category: "General",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await api.post("/tickets", form);
      setSubmitted(true);
      toast.success("Ticket submitted! We'll get back to you soon.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentFaqs = faqs.find((f) => f.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      {/* Header */}
      <div className="text-center">
        <span className="inline-block text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
          Help Center
        </span>
        <h1 className="text-4xl font-bold text-white mb-4">How can we help?</h1>
        <p className="text-white/50 max-w-xl mx-auto">
          Find answers to common questions or submit a support ticket and we'll
          get back to you.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "🏠", label: "Posting a Listing", category: "Listings" },
          { icon: "👤", label: "Account Issues", category: "Account" },
          { icon: "🔍", label: "Finding a Property", category: "Properties" },
          { icon: "৳", label: "Fees & Payments", category: "Payments & Fees" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setActiveCategory(item.category);
              document
                .getElementById("faq")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="glass-card rounded-xl p-5 text-center hover:glass-light transition"
          >
            <p className="text-3xl mb-2">{item.icon}</p>
            <p className="text-white text-sm font-medium">{item.label}</p>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div id="faq">
        <h2 className="text-2xl font-bold text-white mb-6">
          Frequently Asked Questions
        </h2>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {faqs.map((f) => (
            <button
              key={f.category}
              onClick={() => setActiveCategory(f.category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeCategory === f.category
                  ? "bg-emerald-500 text-white"
                  : "glass text-white/60 hover:text-white"
              }`}
            >
              {f.category}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {currentFaqs?.questions.map((item) => (
            <div key={item.q} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-white text-sm pr-4">
                  {item.q}
                </span>
                <span
                  className={`text-emerald-400 transition-transform flex-shrink-0 ${
                    openFaq === item.q ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              {openFaq === item.q && (
                <div className="px-5 pb-5">
                  <div className="w-full h-px bg-white/10 mb-4" />
                  <p className="text-white/60 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Form */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Still Need Help?</h2>
        <p className="text-white/50 mb-8 text-sm">
          Submit a support ticket and we'll get back to you within 24 hours.
        </p>

        {submitted ? (
          <div className="glass-light rounded-2xl p-10 text-center">
            <p className="text-5xl mb-4">✅</p>
            <h3 className="text-xl font-bold text-white mb-2">
              Ticket Submitted!
            </h3>
            <p className="text-white/50 text-sm mb-6">
              We've received your message and will get back to you at{" "}
              <span className="text-white">{form.email}</span> within 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  name: user?.name || "",
                  email: user?.email || "",
                  category: "General",
                  subject: "",
                  message: "",
                });
              }}
              className="px-6 py-2.5 glass text-white text-sm rounded-xl hover:glass-light transition"
            >
              Submit Another Ticket
            </button>
          </div>
        ) : (
          <div className="glass-light rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
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
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 bg-transparent [&>option]:bg-gray-800"
                  >
                    <option value="General">General</option>
                    <option value="Listings">Listings</option>
                    <option value="Account">Account</option>
                    <option value="Properties">Properties</option>
                    <option value="Payments">Payments & Fees</option>
                    <option value="Bug">Bug Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your issue"
                    required
                    className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  required
                  className="w-full px-4 py-2.5 glass rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-white/30 text-xs">
                  We typically respond within 24 hours.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-500/80 backdrop-blur text-white text-sm font-medium rounded-xl hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Ticket →"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Contact Options */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: "✉️",
            label: "Email Us",
            value: "nowtechdev@gmail.com",
            href: "mailto:nowtechdev@gmail.com",
          },
          {
            icon: "💬",
            label: "WhatsApp",
            value: "+880 1302700610",
            href: "https://wa.me/8801302700610",
          },
          {
            icon: "📍",
            label: "Visit Us",
            value: "Pallabi, Dhaka",
            href: "#",
          },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="glass-card rounded-xl p-5 text-center hover:glass-light transition"
          >
            <p className="text-3xl mb-2">{item.icon}</p>
            <p className="text-white font-medium text-sm mb-1">{item.label}</p>
            <p className="text-white/40 text-xs">{item.value}</p>
          </a>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenter;
