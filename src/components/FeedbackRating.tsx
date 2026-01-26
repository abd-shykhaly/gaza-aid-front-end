import { useState } from "react";
import { api } from "../utils/api";
import { useToast } from "../contexts/ToastContext";

interface FeedbackRatingProps {
  postId: number;
  helperId: number;
  onRatingSubmitted?: () => void;
}

export default function FeedbackRating({
  postId,
  helperId,
  onRatingSubmitted,
}: FeedbackRatingProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showError("يرجى اختيار تقييم");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/feedback", {
        post_id: postId,
        helper_id: helperId,
        rating,
        comment: comment.trim() || null,
      });

      showSuccess("تم إرسال تقييمك بنجاح! شكراً لك.");
      setRating(0);
      setComment("");
      setShowForm(false);
      onRatingSubmitted?.();
    } catch (error: any) {
      showError(error.message || "فشل إرسال التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-green-600 hover:text-green-800 font-medium"
      >
        قيم المساعدة
      </button>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h4 className="font-medium text-gray-900 mb-3">قيم هذه المساعدة</h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التقييم
          </label>
          <div className="flex space-x-reverse space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors ${
                  star <= rating
                    ? "text-yellow-400 hover:text-yellow-500"
                    : "text-gray-300 hover:text-gray-400"
                }`}
                disabled={isSubmitting}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            تعليق (اختياري)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="شارك تجربتك مع هذه المساعدة..."
            disabled={isSubmitting}
          />
        </div>

        <div className="flex space-x-reverse space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
