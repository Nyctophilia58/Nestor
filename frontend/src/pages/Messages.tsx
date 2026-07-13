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

  // If viewing a specific conversation
  if (conversationId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              ←
            </button>
            {activeConversation ? (
              <>
                <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-white font-medium">
                  {activeConversation.other_user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{activeConversation.other_user_name}</h2>
                  <p className="text-xs text-white/50 capitalize">{activeConversation.other_user_role}</p>
                </div>
              </>
            ) : (
              <div className="flex-1">
                <h2 className="font-semibold text-white">Conversation</h2>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white/50">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-white/50">No messages yet</p>
                  <p className="text-white/30 text-sm">Send a message to start the conversation</p>
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
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-blue-500/80 text-white rounded-br-md"
                          : "bg-white/10 text-white rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? "text-blue-200" : "text-white/40"}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Conversations list view
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        {totalUnread > 0 && (
          <p className="text-white/50 text-sm mt-1">{totalUnread} unread message{totalUnread !== 1 ? "s" : ""}</p>
        )}
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-white/50">Loading conversations...</div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-5xl mb-4">💬</p>
          <p className="font-medium text-white/70">No messages yet</p>
          <p className="text-white/40 text-sm mt-2">Start a conversation by requesting to view a property</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              onClick={() => window.location.href = `/messages/${conv.conversation_id}`}
              className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:glass-light transition"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center text-white font-medium">
                  {conv.other_user_name.charAt(0).toUpperCase()}
                </div>
                {conv.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {conv.unread_count}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium truncate ${conv.unread_count > 0 ? "text-white" : "text-white/80"}`}>
                    {conv.other_user_name}
                  </h3>
                  <span className="text-xs text-white/40 flex-shrink-0">
                    {conv.last_message_at ? formatTime(conv.last_message_at) : ""}
                  </span>
                </div>
                <p className="text-xs text-white/50 capitalize mb-1">{conv.other_user_role}</p>
                <p className="text-sm text-white/60 truncate">
                  {conv.last_message || "No messages yet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
