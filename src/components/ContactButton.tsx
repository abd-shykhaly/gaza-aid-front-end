import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { api } from "../utils/api";
import { useToast } from "../contexts/ToastContext";

interface ContactButtonProps {
  postOwnerId: number;
  postOwnerUsername: string;
  postId?: number;
  className?: string;
}

export default function ContactButton({
  postOwnerId,
  postOwnerUsername,
  postId,
  className = "",
}: ContactButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id;
  const navigate = useNavigate();

  const handleContact = async () => {
    if (currentUserId === postOwnerId) {
      showError("لا يمكنك التواصل مع نفسك");
      return;
    }

    try {
      setIsSubmitting(true);

      // First try to start a conversation directly
      const conversationResponse = await api.post(
        "/messages/conversations/start",
        {
          otherUserId: postOwnerId,
          postId: postId,
        },
      );

      showSuccess(`تم بدء محادثة مع ${postOwnerUsername}!`);
      setShowModal(false);
      setMessage("");

      // Navigate to the conversation
      navigate(`/messages/${conversationResponse.id}`);
    } catch (error: any) {
      // If conversation start fails, send a contact request
      try {
        await api.post("/messages/contact-requests", {
          recipientId: postOwnerId,
          postId: postId,
          message: message.trim() || null,
        });

        showSuccess(`تم إرسال طلب التواصل إلى ${postOwnerUsername}!`);
        setShowModal(false);
        setMessage("");
      } catch (requestError: any) {
        showError(error.message || "فشل إرسال طلب التواصل");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUserId === postOwnerId) {
    return null; // Don't show button for post owners
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 ${className}`}
      >
        تواصل
      </button>

      {showModal &&
        createPortal(
          <div className="modal-backdrop animate-fade-in-up px-4">
            <div className="modal-content max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold gradient-text">
                  التواصل مع {postOwnerUsername}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMessage("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                  يمكنك إرسال رسالة مباشرة أو طلب تواصل. سيتلقى{" "}
                  {postOwnerUsername} إشعاراً بطلبك.
                </p>

                <div>
                  <label className="label-field">رسالة (اختياري)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="input-field resize-none text-sm sm:text-base"
                    placeholder="اكتب رسالة قصيرة..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleContact}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">جاري الإرسال...</span>
                      <span className="sm:hidden">إرسال...</span>
                    </span>
                  ) : (
                    "إرسال"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMessage("");
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100 text-sm sm:text-base"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
