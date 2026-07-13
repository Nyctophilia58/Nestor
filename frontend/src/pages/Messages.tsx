import { useEffect, useState, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import api, { getErrorMessage } from "../lib/api";
import toast from "react-hot-toast";

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  created_at: string;
  sender_name: string;
  sender_avatar?: string;
  property_title?: string;
  property_images?: string[];
}

interface Conversation {
  conversation_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_role: string;
  other_user_avatar?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

const Messages = () => {
  const { user } = useAuthStore();
  const { conversationId } = useParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/messages/conversations");
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages for specific conversation
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setActiveConversation(null);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/conversation/${conversationId}`);
        setMessages(res.data.messages || []);

        // Set active conversation
        const conv = conversations.find(c => c.conversation_id === parseInt(conversationId));
        if (conv) setActiveConversation(conv);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        toast.error(getErrorMessage(err));
      }
    };
    fetchMessages();
  }, [conversationId, conversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    try {
      const res = await api.post("/messages", {
        recipient_id: activeConversation.other_user_id,
        content: newMessage.trim(),
      });

      // Add the new message to the list
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");

      // Update conversation list to show new message
      setConversations(prev => prev.map(conv =>
        conv.conversation_id === activeConversation.conversation_id
          ? { ...conv, last_message: newMessage.trim(), last_message_at: new Date().toISOString() }
          : conv
      ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()));
    } catch (err) {
      toast.error(getErrorMessage(err));
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Redirect if not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Get total unread count
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="glass-card rounded-2xl overflow-hidden flex h-[calc(100vh-140px)] min-h-[540px]">
        {/* ── Sidebar: conversation list ───────────────────────── */}
        <aside
          className={`w-full md:w-[320px] md:shrink-0 md:flex md:flex-col border-white/10 md:border-r ${
            conversationId ? "hidden" : "flex flex-col"
          }`}
        >
          <div className="px-5 py-4 border-b border-white/10">
            <h1 className="text-lg font-bold text-white">Messages</h1>
            {totalUnread > 0 && (
              <p className="text-white/50 text-xs mt-0.5">
                {totalUnread} unread message{totalUnread !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 glass rounded-xl animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-white/70 text-sm font-medium">No messages yet</p>
                <p className="text-white/30 text-xs mt-1">
                  Start a conversation by requesting to view a property
                </p>
              </div>
            ) : (
              <ul>
                {conversations.map((conv) => {
                  const isActive = conversationId
                    ? conv.conversation_id === parseInt(conversationId)
                    : false;
                  return (
                    <li key={conv.conversation_id}>
                      <button
                        type="button"
                        onClick={() => (window.location.href = `/messages/${conv.conversation_id}`)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-l-2 ${
                          isActive
                            ? "bg-blue-500/10 border-blue-400"
                            : "border-transparent hover:bg-white/5"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-blue-500/30 flex items-center justify-center text-white font-medium">
                            {conv.other_user_name.charAt(0).toUpperCase()}
                          </div>
                          {conv.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm truncate ${
                                conv.unread_count > 0
                                  ? "text-white font-semibold"
                                  : "text-white/80 font-medium"
                              }`}
                            >
                              {conv.other_user_name}
                            </span>
                            <span className="text-[11px] text-white/40 shrink-0">
                              {conv.last_message_at ? formatTime(conv.last_message_at) : ""}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 capitalize">{conv.other_user_role}</p>
                          <p className="text-xs text-white/40 truncate">
                            {conv.last_message || "No messages yet"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ── Chat pane ─────────────────────────────────────────── */}
        <section
          className={`flex-1 min-w-0 md:flex md:flex-col ${
            conversationId ? "flex flex-col" : "hidden"
          }`}
        >
          {!conversationId ? (
            <div className="flex-1 items-center justify-center hidden md:flex">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-white/40 text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-lg transition text-white/70"
                  aria-label="Back to conversations"
                >
                  ←
                </button>
                {activeConversation ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-white font-medium shrink-0">
                      {activeConversation.other_user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-white text-sm truncate">
                        {activeConversation.other_user_name}
                      </h2>
                      <p className="text-xs text-white/50 capitalize">
                        {activeConversation.other_user_role}
                      </p>
                    </div>
                  </>
                ) : (
                  <h2 className="font-semibold text-white text-sm">Conversation</h2>
                )}
              </div>

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white/50 text-sm">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-4xl mb-2">💬</p>
                      <p className="text-white/50 text-sm">No messages yet</p>
                      <p className="text-white/30 text-xs mt-1">
                        Send a message to start the conversation
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-blue-500/80 text-white rounded-br-md"
                              : "bg-white/10 text-white rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p
                            className={`text-[10px] mt-1 text-right ${
                              isOwn ? "text-blue-200" : "text-white/40"
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-white/10 flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                >
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Messages;
