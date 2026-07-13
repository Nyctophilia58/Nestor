import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { type Property, type ViewingRequest } from "../types";
import { useAuthStore } from "../store/authStore";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorState from "../components/ErrorState";

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isLandlord = user?.role === "landlord" || user?.role === "admin";
  const isTenant = user?.role === "tenant";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isLandlord) {
          const [propertiesRes, requestsRes] = await Promise.all([
            api.get("/properties/mine"),
            api.get("/viewing-requests/my-properties"),
          ]);
          setProperties(propertiesRes.data);
          setViewingRequests(requestsRes.data);
        } else if (isTenant) {
          const requestsRes = await api.get("/viewing-requests/mine");
          setViewingRequests(requestsRes.data);
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLandlord, isTenant]);

  // Redirect if not logged in
  if (!user) return <Navigate to="/login" replace />;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await api.delete(`/properties/${deleteId}`);
      setProperties((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
      toast.success("Property deleted");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      console.error(err);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await api.patch(`/viewing-requests/${requestId}`, { status: "approved" });
      setViewingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "approved" as const } : r)),
      );
      toast.success("Viewing request approved!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      console.error(err);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await api.patch(`/viewing-requests/${requestId}`, { status: "rejected" });
      setViewingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" as const } : r)),
      );
      toast.success("Viewing request rejected");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      console.error(err);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await api.patch(`/viewing-requests/${requestId}`, { status: "cancelled" });
      setViewingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "cancelled" as const } : r)),
      );
      toast.success("Viewing request cancelled");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      console.error(err);
    }
  };

  const handleStartConversation = async (userId: number) => {
    // Validate userId parameter
    if (userId === undefined || userId === null || typeof userId !== 'number' || !Number.isFinite(userId) || userId <= 0) {
      toast.error('Invalid user ID');
      return;
    }

    try {
      // Get or create a conversation with this user
      const res = await api.get(`/messages/user/${userId}`);

      // Validate response
      if (!res.data) {
        throw new Error('No data received from server');
      }

      if (typeof res.data !== 'object' || res.data === null) {
        throw new Error('Invalid response format from server');
      }

      if (!('conversation_id' in res.data) || res.data.conversation_id === undefined || res.data.conversation_id === null) {
        throw new Error('Conversation ID not found in server response');
      }

      const conversationId = res.data.conversation_id;

      // Validate conversationId
      if (typeof conversationId !== 'number' || !Number.isFinite(conversationId) || conversationId <= 0) {
        throw new Error(`Invalid conversation ID received: ${conversationId}`);
      }

      // Navigate to the conversation
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      // Handle 401 Unauthorized - likely expired token
      if (err.response?.status === 401) {
        // Clear auth state and redirect to login
        logout();
        navigate("/login");
        return;
      }

      // Log detailed error for debugging
      console.error('[handleStartConversation] Failed to start conversation:', {
        error: err instanceof Error ? err : String(err),
        message: err instanceof Error ? err.message : 'Unknown error',
        userId,
        status: err.response?.status,
        timestamp: new Date().toISOString()
      });

      // Show user-friendly error message
      toast.error(getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            My Dashboard
          </h1>
          <p className="text-white/50 text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {isLandlord && (
            <Link
              to="/add-property"
              className="px-4 py-2 bg-blue-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition"
            >
              + Add Property
            </Link>
          )}

          {isTenant && (
            <Link
              to="/listings"
              className="px-4 py-2 bg-blue-500/80 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition"
            >
              🔍 Find Property
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 glass text-white/70 text-sm font-medium rounded-lg hover:glass-light hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tenant Dashboard */}
      {isTenant ? (
        <div className="space-y-8">
          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "🔍", label: "Browse Listings", path: "/listings", desc: "Find your ideal home" },
                { icon: "❤️", label: "Saved Properties", path: "/favourites", desc: "Your saved listings" },
                { icon: "💬", label: "Messages", path: "/messages", desc: "Chat with landlords" },
              ].map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="glass-card rounded-xl p-4 hover:glass-light transition group"
                >
                  <span className="text-2xl mb-2 block">{action.icon}</span>
                  <p className="text-white font-medium text-sm group-hover:text-emerald-400 transition">
                    {action.label}
                  </p>
                  <p className="text-white/40 text-xs mt-1">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Viewing Requests */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">📅 My Viewing Requests</h3>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 glass rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : viewingRequests.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl text-white/30 border border-dashed border-white/10">
                <p className="text-4xl mb-4">📋</p>
                <p className="font-medium text-white/50">No viewing requests yet</p>
                <p className="text-sm text-white/30 mt-1">Browse properties and request a viewing</p>
                <Link
                  to="/listings"
                  className="inline-block mt-4 px-5 py-2 bg-emerald-500/80 backdrop-blur text-white text-sm rounded-lg hover:bg-emerald-500 transition"
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {viewingRequests.map((request) => (
                  <div key={request.id} className="glass-card rounded-2xl p-4">
                    <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                      {/* Property Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/20 flex-shrink-0">
                        {request.property_images?.[0] ? (
                          <img
                            src={request.property_images[0]}
                            alt={request.property_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-white/20">
                            🏠
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {request.property_title}
                        </h3>
                        <p className="text-sm text-white/50 truncate">
                          📍 {request.property_location}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-white/60">
                          <span>📅 {new Date(request.preferred_date).toLocaleDateString()}</span>
                          <span>🕐 {request.preferred_time}</span>
                        </div>
                        {request.landlord_name && (
                          <p className="text-sm text-white/50 mt-1">
                            Landlord: {request.landlord_name}
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                              : request.status === "approved"
                              ? "bg-green-500/20 text-green-300 border border-green-400/30"
                              : request.status === "rejected"
                              ? "bg-red-500/20 text-red-300 border border-red-400/30"
                              : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                          }`}
                        >
                          {request.status === "pending" && "⏳ Pending"}
                          {request.status === "approved" && "✅ Approved"}
                          {request.status === "rejected" && "❌ Rejected"}
                          {request.status === "cancelled" && "❌ Cancelled"}
                        </span>
                        {request.status === "approved" && request.landlord_phone && (
                          <a
                            href={`https://wa.me/${request.landlord_phone.replace(/[^\d]/g, "").replace(/^88/, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition"
                          >
                            📞 Contact
                          </a>
                        )}
                        {request.status === "approved" && request.landlord_id && (
                            <button
                              onClick={() => {
                                handleStartConversation(request.landlord_id);
                              }}
                              className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition"
                            >
                              💬 Message
                            </button>
                          )}
                        {request.status === "pending" && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="px-3 py-1.5 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Landlord/Admin Dashboard */
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total Listings", value: properties.length },
              {
                label: "For Rent",
                value: properties.filter((p) => p.type === "rent").length,
              },
              {
                label: "For Sale",
                value: properties.filter((p) => p.type === "sale").length,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
                <p className="text-sm text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Error */}
          {error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 glass rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl text-white/30 border border-dashed border-white/10">
              <p className="text-5xl mb-4">🏠</p>
              <p className="font-medium text-white/50">No listings yet</p>
              <Link
                to="/add-property"
                className="inline-block mt-4 px-5 py-2 bg-blue-500/80 backdrop-blur text-white text-sm rounded-lg hover:bg-blue-500 transition"
              >
                Post your first property
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4 flex-wrap md:flex-nowrap"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/20 flex-shrink-0">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-white/20">
                        🏠
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {property.title}
                    </h3>
                    <p className="text-sm text-white/50 truncate">
                      📍 {property.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur ${
                          property.type === "rent"
                            ? "bg-green-500/20 text-green-300 border border-green-400/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                        }`}
                      >
                        {property.type === "rent" ? "For Rent" : "For Sale"}
                      </span>
                      <span className="text-xs text-white/40 capitalize">
                        {property.category}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-blue-400">
                      ৳{property.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/30">
                      {property.type === "rent" ? "/month" : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      to={`/listings/${property.id}`}
                      className="px-3 py-1.5 text-xs glass text-white/70 rounded-lg hover:glass-light hover:text-white transition text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setDeleteId(property.id)}
                      className="px-3 py-1.5 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Viewing Requests for Landlords */}
          {isLandlord && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 mt-8">📥 Viewing Requests for My Properties</h3>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 glass rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : viewingRequests.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl text-white/30 border border-dashed border-white/10">
                  <p className="text-4xl mb-4">📋</p>
                  <p className="font-medium text-white/50">No viewing requests yet</p>
                  <p className="text-sm text-white/30 mt-1">When tenants request to view your properties, they will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewingRequests.map((request) => (
                    <div key={request.id} className="glass-card rounded-2xl p-4">
                      <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                        {/* Property Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/20 flex-shrink-0">
                          {request.property_images?.[0] ? (
                            <img
                              src={request.property_images[0]}
                              alt={request.property_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-white/20">
                              🏠
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {request.property_title}
                          </h3>
                          <p className="text-sm text-white/50 truncate">
                            📍 {request.property_location}
                          </p>
                          <p className="text-sm text-white/60 mt-2">
                            👤 Tenant: {request.tenant_name} ({request.tenant_email})
                          </p>
                          {request.tenant_phone && (
                            <p className="text-sm text-white/50">
                              📞 {request.tenant_phone}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-sm text-white/60">
                            <span>📅 {new Date(request.preferred_date).toLocaleDateString()}</span>
                            <span>🕐 {request.preferred_time}</span>
                          </div>
                          {request.message && (
                            <p className="text-sm text-white/50 mt-2 italic">
                              "{request.message}"
                            </p>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              request.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                                : request.status === "approved"
                                ? "bg-green-500/20 text-green-300 border border-green-400/30"
                                : request.status === "rejected"
                                ? "bg-red-500/20 text-red-300 border border-red-400/30"
                                : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                            }`}
                          >
                            {request.status === "pending" && "⏳ Pending"}
                            {request.status === "approved" && "✅ Approved"}
                            {request.status === "rejected" && "❌ Rejected"}
                            {request.status === "cancelled" && "❌ Cancelled"}
                          </span>
                          {request.status === "approved" && request.tenant_phone && (
                            <a
                              href={`https://wa.me/${request.tenant_phone.replace(/[^\d]/g, "").replace(/^88/, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition"
                            >
                              📞 Contact Tenant
                            </a>
                          )}
                          {request.status === "approved" && request.user_id && (
                            <button
                              onClick={() => {
                                handleStartConversation(request.user_id);
                              }}
                              className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition"
                            >
                              💬 Message
                            </button>
                          )}
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="px-3 py-1.5 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="px-3 py-1.5 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* End of isTenant check */}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        message="Delete this property? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Dashboard;
