import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

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

const AdminPanel = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tab, setTab] = useState<"users" | "tickets">("users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ticketsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/tickets"),
        ]);
        setUsers(usersRes.data);
        setTickets(ticketsRes.data);
      } catch {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm">Delete this user?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/admin/users/${id}`);
                setUsers((prev) => prev.filter((u) => u.id !== id));
                toast.success("User deleted");
              } catch {
                toast.error("Failed to delete user");
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-500/20 text-purple-300 border border-purple-400/30",
      landlord: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
      tenant: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
    };
    return styles[role] || styles.tenant;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-white/50 text-sm mt-1">
            Manage users and support tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tickets"
            className="px-4 py-2 glass text-white/70 hover:text-white text-sm rounded-xl hover:glass-light transition"
          >
            🎫 All Tickets
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Users", value: users.length, icon: "👥" },
          {
            label: "Landlords",
            value: users.filter((u) => u.role === "landlord").length,
            icon: "🏠",
          },
          {
            label: "Open Tickets",
            value: tickets.filter((t) => t.status === "open").length,
            icon: "🎫",
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["users", "tickets"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-emerald-500 text-white"
                : "glass text-white/60 hover:text-white"
            }`}
          >
            {t === "users"
              ? `👥 Users (${users.length})`
              : `🎫 Tickets (${tickets.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-16 animate-pulse" />
          ))}
        </div>
      ) : tab === "users" ? (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="glass-card rounded-2xl p-4 flex items-center gap-4 flex-wrap md:flex-nowrap"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{u.name}</p>
                <p className="text-white/40 text-xs truncate">{u.email}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge(u.role)}`}
              >
                {u.role}
              </span>
              {/* Role Selector */}
              {u.id !== user.id && (
                <div className="relative flex-shrink-0">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-3 py-1.5 glass rounded-lg text-white text-xs focus:outline-none bg-transparent [&>option]:bg-gray-800 appearance-none pr-6"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 4L6 8L10 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}
              {u.id !== user.id && (
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="px-3 py-1.5 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition flex-shrink-0"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-white/30">
              <p className="text-4xl mb-3">🎫</p>
              <p>No tickets yet</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-medium text-white text-sm">
                      #{t.id} — {t.subject}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {t.name} · {t.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full glass text-white/50 capitalize">
                      {t.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.status === "open"
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">
                  {t.message}
                </p>
                <p className="text-white/20 text-xs mt-3">
                  {new Date(t.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
