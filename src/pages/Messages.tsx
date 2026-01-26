import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
import { useToast } from "../contexts/ToastContext";

interface Conversation {
  id: number;
  other_username: string;
  other_user_id: number;
  last_message_preview: string;
  last_message_at: string;
  unread_count: number;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/messages/conversations");
      setConversations(response);
    } catch (error: any) {
      showError(error.message || "فشل جلب المحادثات");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffMins < 1440) return `منذ ${Math.floor(diffMins / 60)} ساعة`;
    return date.toLocaleDateString("ar-SA");
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
    <div className="px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-3">الرسائل</h1>
        <p className="text-gray-600 text-lg">
          تواصل مع المستخدمين الآخرين لتنسيق المساعدة
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-6">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            لا توجد رسائل بعد
          </h3>
          <p className="text-gray-600 text-lg mb-6">
            ابدأ بالتواصل مع المستخدمين الآخرين من خلال المنشورات
          </p>
          <Link to="/" className="btn-primary">
            استكشف المنشورات
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation, index) => (
            <div
              key={conversation.id}
              className="conversation-item animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`${conversation.id}`)}
            >
              <div className="flex items-start space-x-reverse space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg ring-2 ring-white/50">
                    {conversation.other_username?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 truncate text-lg">
                      {conversation.other_username}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 bg-gray-100 px-2 py-1 rounded-lg font-medium">
                      {formatDate(conversation.last_message_at)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-200/30">
                    {conversation.last_message_preview || "لا توجد رسائل"}
                  </p>
                </div>

                {conversation.unread_count > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg ring-2 ring-white/50 animate-pulse-slow">
                      {conversation.unread_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
