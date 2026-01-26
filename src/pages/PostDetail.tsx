import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
import { Post } from "../types";
import { useToast } from "../contexts/ToastContext";
import { authStorage } from "../utils/auth";
import FeedbackBadge from "../components/FeedbackBadge";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userMatches, setUserMatches] = useState<number[]>([]);
  const { showSuccess, showError } = useToast();
  const currentUser = authStorage.getUser();
  const currentUserId = currentUser?.id || 0;

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
      fetchUserMatches();
    }
  }, [id]);

  const fetchUserMatches = async () => {
    try {
      const response = await api.get("/matches/my");
      const postIds = response.map((match: any) => match.post_id);
      setUserMatches(postIds);
    } catch (error) {
      console.error("Error fetching user matches:", error);
    }
  };

  const fetchPost = async (postId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${postId}`);
      setPost(response);
    } catch (err: any) {
      setError(err.message || "فشل جلب تفاصيل المنشور");
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!post) return;

    try {
      // Start the match
      await api.post("/matches", { post_id: post.id });

      // Start a conversation directly with a contextual message
      const conversationResponse = await api.post(
        "/messages/conversations/start",
        {
          otherUserId: post.user_id,
          postId: post.id,
        },
      );

      // Send an initial message based on post type
      const initialMessage =
        post.type === "HAVE"
          ? `مرحباً، أنا مهتم بـ ${post.item_name} الذي نشرته. هل لا يزال متاحاً؟`
          : `مرحباً، يمكنني المساعدة في توفير ${post.item_name}. كيف يمكنني التواصل معك؟`;

      await api.post(
        `/messages/conversations/${conversationResponse.id}/messages`,
        {
          content: initialMessage,
        },
      );

      const actionMessage =
        post.type === "HAVE"
          ? "تم بدء محادثة مع صاحب المنشور!"
          : "تم بدء محادثة مع الشخص المحتاج مساعدة!";

      showSuccess(actionMessage);
      setUserMatches([...userMatches, post.id]);
      fetchPost(post.id);

      // Navigate to the conversation
      navigate(`/messages/${conversationResponse.id}`);
    } catch (error: any) {
      showError(error.message || "فشل تسجيل المشاركة");
    }
  };

  const isButtonDisabled = () => {
    if (!post) return true;
    const isOwner = post.user_id === currentUserId;
    const hasInteracted = userMatches.includes(post.id);
    return isOwner || hasInteracted;
  };

  const handleComplete = async () => {
    if (!post) return;

    if (confirm("هل أنت متأكد من إكمال هذا المنشور؟")) {
      try {
        await api.patch(`/posts/${post.id}/complete`);
        showSuccess("تم إكمال المنشور بنجاح! شكراً لك على مساعدتك.");
        navigate("/");
      } catch (error: any) {
        showError(error.message || "فشل إكمال المنشور");
      }
    }
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

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 text-red-600 px-6 py-4 rounded-2xl max-w-md mx-auto shadow-lg">
          {error || "المنشور غير موجود"}
        </div>
        <button onClick={() => navigate("/")} className="mt-6 btn-secondary">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const isOwner = post.user_id === currentUserId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/")}
        className="mb-8 text-gray-600 hover:text-gray-900 flex items-center font-medium transition-colors duration-200 hover:-translate-x-1 transform"
      >
        ← العودة للمنشورات
      </button>

      <div className="glass-card">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-reverse space-x-6">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-2xl text-lg font-bold shadow-lg ${
                post.type === "HAVE"
                  ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/50"
                  : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200/50"
              }`}
            >
              {post.type_ar}
            </span>
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                {post.item_name}
              </h1>
              <p className="text-sm text-gray-600">
                بواسطة{" "}
                <Link
                  to={`/user/${post.user_id}`}
                  className="text-gray-700 hover:underline font-medium"
                >
                  {post.username}
                </Link>{" "}
                • {new Date(post.created_at).toLocaleDateString("ar-SA")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-reverse space-x-4">
            <FeedbackBadge postId={post.id} postType={post.type} />
            {post.status === "completed" && (
              <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200/50 shadow-sm">
                تم إكماله 🤍
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200/50">
              <span className="font-bold text-gray-700 block mb-1">الفئة:</span>
              <span className="text-gray-900 font-medium">
                {post.category_ar}
              </span>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200/50">
              <span className="font-bold text-gray-700 block mb-1">
                الكمية:
              </span>
              <span className="text-gray-900 font-medium">{post.quantity}</span>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200/50">
              <span className="font-bold text-gray-700 block mb-1">
                المنطقة:
              </span>
              <span className="text-gray-900 font-medium">{post.area_ar}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200/50">
              <span className="font-bold text-gray-700 block mb-1">
                الحالة:
              </span>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold ${
                  post.status === "active"
                    ? "status-badge-active"
                    : "status-badge-completed"
                }`}
              >
                {post.status === "active" ? "نشط" : "مكتمل"}
              </span>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200/50">
              <span className="font-bold text-gray-700 block mb-1">
                رقم المنشور:
              </span>
              <span className="text-gray-900 font-medium">#{post.id}</span>
            </div>
          </div>
        </div>

        {post.description && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-3 text-lg">الوصف:</h3>
            <p className="text-gray-900 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200/50 leading-relaxed">
              {post.description}
            </p>
          </div>
        )}

        {post.status === "active" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleMatch}
              disabled={isButtonDisabled()}
              className={`flex-1 py-4 px-8 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 ${
                isButtonDisabled()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : post.type === "HAVE"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              }`}
            >
              {post.user_id === currentUserId
                ? "منشورك"
                : userMatches.includes(post.id)
                  ? "تم المشاركة"
                  : post.type === "HAVE"
                    ? "أنا محتاج هذا"
                    : "أقدر أساعد"}
            </button>

            {!isOwner && (
              <Link
                to={`/user/${post.user_id}`}
                className="flex-1 py-4 px-8 rounded-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95"
              >
                عرض ملف المستخدم
              </Link>
            )}

            {isOwner && (
              <button onClick={handleComplete} className="btn-primary">
                تم إكمال المساعدة 🤍
              </button>
            )}
          </div>
        )}

        {post.status === "completed" && isOwner && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 text-emerald-800 px-6 py-4 rounded-2xl shadow-lg">
            تم إكمال هذا المنشور بنجاح. شكراً لك على مساعدتك!
          </div>
        )}
      </div>
    </div>
  );
}
