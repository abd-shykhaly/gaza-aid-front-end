import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { useToast } from "../contexts/ToastContext";

interface FeedbackItem {
  id: number;
  post_id: number;
  item_name: string;
  post_type: "HAVE" | "NEED";
  category: string;
  category_ar: string;
  area: string;
  area_ar: string;
  quantity: string;
  description?: string;
  action_type: string;
  participant_role?: string;
  post_owner_username?: string;
  helper_username?: string;
  created_at: string;
  status: "active" | "completed";
}

export default function FeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "offered" | "received">("all");
  const { showError } = useToast();

  useEffect(() => {
    fetchFeedbacks();
  }, [filter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let endpoint = "/matches/my";

      if (filter === "received") {
        endpoint = "/matches/received";
      }

      const response = await api.get(endpoint);
      setFeedbacks(response);
    } catch (error: any) {
      showError(error.message || "فشل جلب سجل التغذية الراجعة");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold gradient-text">
          سجل التغذية الراجعة
        </h1>
        <Link to="/" className="btn-secondary">
          العودة للرئيسية
        </Link>
      </div>

      <div className="glass-card mb-8">
        <h2 className="text-xl font-semibold mb-6 gradient-text">
          تصفية السجل
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              filter === "all"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
            }`}
          >
            كل النشاطات
          </button>
          <button
            onClick={() => setFilter("offered")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              filter === "offered"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
            }`}
          >
            المساعدات التي قدمتها
          </button>
          <button
            onClick={() => setFilter("received")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              filter === "received"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
            }`}
          >
            المساعدات التي تلقيتها
          </button>
        </div>
      </div>

      {feedbacks.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            لا يوجد سجل للأنشطة
          </h3>
          <p className="text-gray-600 mb-6 text-lg">
            {filter === "all"
              ? "لم تقم بأي أنشطة مساعدة بعد"
              : filter === "offered"
                ? "لم تقدم أي مساعدات بعد"
                : "لم تتلق أي مساعدات بعد"}
          </p>
          <Link to="/" className="btn-primary">
            استكشف المنشورات
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((feedback, index) => (
            <div
              key={feedback.id}
              className="post-card hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-reverse space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                      feedback.post_type === "HAVE"
                        ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/50"
                        : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200/50"
                    }`}
                  >
                    {feedback.post_type === "HAVE" ? "لدي" : "أحتاج"}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                      feedback.status === "active"
                        ? "status-badge-active"
                        : "status-badge-completed"
                    }`}
                  >
                    {feedback.status === "active" ? "نشط" : "مكتمل"}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">
                  {formatDate(feedback.created_at)}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feedback.item_name}
                </h3>

                {/* Post details in a clean layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 rounded-xl border border-gray-200/50">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-semibold">الكمية:</span>
                      <span className="mr-2 font-medium">
                        {feedback.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 rounded-xl border border-gray-200/50">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-semibold">الفئة:</span>
                      <span className="mr-2 font-medium">
                        {feedback.category_ar}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 rounded-xl border border-gray-200/50">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-semibold">المنطقة:</span>
                      <span className="mr-2 font-medium">
                        {feedback.area_ar}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description preview */}
                {feedback.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 bg-gray-50 p-3 rounded-lg">
                    {feedback.description}
                  </p>
                )}

                <p className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100/50">
                  <span className="font-semibold text-blue-800">
                    {feedback.action_type}
                  </span>
                  <span className="text-gray-600">
                    {" "}
                    •
                    {filter === "received"
                      ? ` بواسطة ${feedback.helper_username || "مستخدم"}`
                      : ` بواسطة ${feedback.post_owner_username || "مستخدم"}`}
                    {feedback.participant_role &&
                      ` • ${feedback.participant_role}`}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                  رقم المنشور: #{feedback.post_id}
                </span>
                <Link
                  to={`/post/${feedback.post_id}`}
                  className="text-sm text-emerald-600 hover:text-emerald-800 font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-lg border border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
