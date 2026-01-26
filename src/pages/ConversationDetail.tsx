import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useToast } from "../contexts/ToastContext";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  username: string;
  created_at: string;
  is_read: boolean;
}

export default function ConversationDetail() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/messages/conversations/${conversationId}/messages`,
      );
      setMessages(response);
    } catch (error: any) {
      showError(error.message || "فشل جلب الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      setSending(true);
      const response = await api.post(
        `/messages/conversations/${conversationId}/messages`,
        {
          content: newMessage.trim(),
        },
      );
      setMessages([...messages, response]);
      setNewMessage("");
    } catch (error: any) {
      showError(error.message || "فشل إرسال الرسالة");
    } finally {
      setSending(false);
    }
  };

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || 0;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-enhanced h-16 w-16 mx-auto mb-6"></div>
        <p className="text-gray-600 font-medium animate-pulse-slow">
          جاري التحميل...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 py-4 sm:px-4">
      <button
        onClick={() => navigate("/messages")}
        className="mb-4 text-gray-600 hover:text-gray-900 flex items-center font-medium transition-colors duration-200 hover:-translate-x-1 transform"
      >
        ← العودة للرسائل
      </button>

      <div className="glass-card">
        <div className="border-b border-gray-200/50 pb-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">
            المحادثة
          </h2>
        </div>

        <div className="space-y-4 mb-6 max-h-[50vh] sm:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200/30">
              <div className="text-6xl mb-4">💬</div>
              <p className="font-medium">لا توجد رسائل بعد. ابدأ المحادثة!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-fade-in-up py-2 ${
                  message.sender_id === getCurrentUserId()
                    ? "justify-start"
                    : "justify-end"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Avatar for current user */}
                {message.sender_id === getCurrentUserId() && (
                  <div className="flex-shrink-0 animate-slide-in-left">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/50">
                      {JSON.parse(localStorage.getItem("user") || "{}")
                        .username?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 transition-all duration-300 ${
                    message.sender_id === getCurrentUserId()
                      ? "message-bubble-sent"
                      : "message-bubble-received"
                  }`}
                >
                  {/* Username above message */}
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      message.sender_id === getCurrentUserId()
                        ? "text-blue-100"
                        : "text-gray-600"
                    }`}
                  >
                    {message.sender_id === getCurrentUserId()
                      ? "أنت"
                      : message.username}
                  </p>

                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === getCurrentUserId()
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>

                {/* Avatar for other users */}
                {message.sender_id !== getCurrentUserId() && (
                  <div className="flex-shrink-0 animate-slide-in-right">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/50">
                      {message.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="flex gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200/50 shadow-lg"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="w-full px-4 py-2 sm:py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 font-medium text-sm sm:text-base pr-12"
              disabled={sending}
            />
            {!newMessage.trim() && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="hidden sm:inline">جاري الإرسال</span>
                <span className="sm:hidden">إرسال</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <span className="hidden sm:inline">إرسال</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
