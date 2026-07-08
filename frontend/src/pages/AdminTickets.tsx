import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

interface Ticket {
  id: number;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminTickets = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const url =
        filter === "all"
          ? "/admin/tickets"
          : `/admin/tickets?status=${filter}`;
      const res = await api.get(url);
      setTickets(res.data);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      setLoading(true);
      fetchTickets();
    }
  }, [filter]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/admin/tickets/${id}/status`, { status });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t)),
      );
      toast.success(
        status === "resolved" ? "Ticket marked as resolved" : "Ticket reopened",
      );
    } catch {
      toast.error("Failed to update ticket");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this ticket permanently?")) return;
    try {
      await api.delete(`/admin/tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast.success("Ticket deleted");
    } catch {
      toast.error("Failed to delete ticket");
    }
  };

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      General: "💬",
      Listings: "🏠",
      Account: "👤",
      Properties: "🔍",
      Payments: "💰",
      Bug: "🐛",
      Other: "📋",
    };
    return icons[cat] || "📋";
  };

  const statusBadge = (status: string) => {
    if (status === "open") {
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30";
    }
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30";
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="text-white/40 hover:text-white transition"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">
              Support Tickets
            </h1>
          </div>
          <p className="text-white/50 text-sm mt-1">
            Manage incoming support requests
          </p>
        </div>
        <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-400/30 px-3 py-1 rounded-full">
          👑 Admin
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Tickets",
            value: tickets.length,
            icon: "🎫",
          },
          {
            label: "Open",
            value: tickets.filter((t) => t.status === "open").length,
            icon: "🟡",
          },
          {
            label: "Resolved",
            value: tickets.filter((t) => t.status === "resolved").length,
            icon: "✅",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-5 text-center"
          >
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-emerald-400">{stat.value}</p>
            <p className="text-xs text-white/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "all", label: "All Tickets" },
          { value: "open", label: "Open" },
          { value: "resolved", label: "Resolved" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.value
                ? "bg-emerald-500 text-white"
                : "glass text-white/60 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-white/50">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="glass-card rounded-2xl overflow-hidden">
              {/* Ticket Header */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === t.id ? null : t.id)
                }
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <span className="text-xl flex-shrink-0">
                  {getCategoryIcon(t.category)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/40 text-xs">#{t.id}</span>
                    <p className="font-medium text-white text-sm truncate">
                      {t.subject}
                    </p>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">
                    {t.name} · {t.email} ·{" "}
                    {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(t.status)}`}
                  >
                    {t.status}
                  </span>
                  <span
                    className={`text-white/30 transition-transform flex-shrink-0 ${
                      expandedId === t.id ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
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
                </div>
              </button>

              {/* Ticket Details */}
              {expandedId === t.id && (
                <div className="px-4 pb-4">
                  <div className="w-full h-px bg-white/10 mb-4" />
                  <div className="mb-4">
                    <span className="text-xs px-2 py-0.5 rounded-full glass text-white/50 capitalize">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {t.message}
                  </p>
                  <div className="flex items-center gap-2">
                    {t.status === "open" ? (
                      <button
                        onClick={() => handleStatusChange(t.id, "resolved")}
                        className="px-3 py-1.5 text-xs bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition"
                      >
                        ✅ Mark as Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(t.id, "open")}
                        className="px-3 py-1.5 text-xs bg-yellow-500/15 text-yellow-400 rounded-lg hover:bg-yellow-500/25 transition"
                      >
                        🔄 Reopen
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="px-3 py-1.5 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
