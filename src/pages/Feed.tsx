import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Post } from "../types";
import { useToast } from "../contexts/ToastContext";
import { authStorage } from "../utils/auth";
import FeedbackBadge from "../components/FeedbackBadge";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMatches, setUserMatches] = useState<number[]>([]); // Track post IDs user has interacted with
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    area: "",
  });
  const { showSuccess, showError } = useToast();
  const currentUser = authStorage.getUser();
  const navigate = useNavigate();
  const currentUserId = currentUser?.id || 0;

  console.log("Current user:", currentUser);

  useEffect(() => {
    fetchPosts();
    fetchUserMatches();
  }, [filters]);

  const fetchUserMatches = async () => {
    try {
      const response = await api.get("/matches/my");
      const postIds = response.map((match: any) => match.post_id);
      setUserMatches(postIds);
    } catch (error) {
      console.error("Error fetching user matches:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.area) params.append("area", filters.area);

      const response = await api.get(`/posts?${params.toString()}`);
      setPosts(response);
    } catch (error) {
      console.error("فشل جلب المنشورات:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Start the match
      await api.post("/matches", { post_id: postId });

      // Start a conversation directly with a contextual message
      const conversationResponse = await api.post(
        "/messages/conversations/start",
        {
          otherUserId: post.user_id,
          postId: postId,
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
      setUserMatches([...userMatches, postId]);
      fetchPosts();

      // Navigate to the conversation
      navigate(`/messages/${conversationResponse.id}`);
    } catch (error: any) {
      showError(error.message || "فشل تسجيل المشاركة");
    }
  };

  const isButtonDisabled = (post: Post) => {
    const isOwner = post.user_id === currentUserId;
    const hasInteracted = userMatches.includes(post.id);
    console.log("Debug:", {
      currentUserId,
      postUserId: post.user_id,
      isOwner,
      hasInteracted,
      postId: post.id,
    });
    return isOwner || hasInteracted;
  };

  const categories = [
    { value: "food", label: "طعام" },
    { value: "water", label: "مياه" },
    { value: "medical", label: "طبي" },
    { value: "baby", label: "أطفال" },
    { value: "power", label: "طاقة" },
    { value: "other", label: "أخرى" },
  ];

  const areas = [
    { value: "North Gaza", label: "شمال غزة" },
    { value: "Gaza City", label: "مدينة غزة" },
    { value: "Deir Al-Balah", label: "دير البلح" },
    { value: "Khan Younis", label: "خان يونس" },
    { value: "Rafah", label: "رفح" },
  ];

  return (
    <div className="px-2 py-4 sm:px-4">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-4">
          المنشورات المتاحة
        </h1>

        <div className="glass-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-field text-sm sm:text-base"
            >
              <option value="">جميع الأنواع</option>
              <option value="HAVE">لدي</option>
              <option value="NEED">أحتاج</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="input-field text-sm sm:text-base"
            >
              <option value="">جميع الفئات</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              className="input-field text-sm sm:text-base"
            >
              <option value="">جميع المناطق</option>
              {areas.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setFilters({ type: "", category: "", area: "" })}
              className="btn-secondary text-sm sm:text-base"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="spinner-enhanced h-16 w-16 mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium animate-pulse-slow">
            جاري التحميل...
          </p>
        </div>
      ) : posts.length === 0 ? (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            لا توجد منشورات متاحة حالياً
          </h3>
          <p className="text-gray-600 mb-6">
            حاول تغيير الفلاتر أو العودة لاحقاً
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="post-card hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-reverse space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                      post.type === "HAVE"
                        ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/50"
                        : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200/50"
                    }`}
                  >
                    {post.type_ar}
                  </span>
                  <FeedbackBadge
                    postId={post.id}
                    postType={post.type}
                    className="text-xs"
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">
                  {new Date(post.created_at).toLocaleDateString("ar-SA")}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {post.item_name}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 p-2 rounded-lg">
                  <span className="font-semibold">الكمية:</span>
                  <span className="mr-2 font-medium">{post.quantity}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 p-2 rounded-lg">
                  <span className="font-semibold">الفئة:</span>
                  <span className="mr-2 font-medium">{post.category_ar}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 p-2 rounded-lg">
                  <span className="font-semibold">المنطقة:</span>
                  <span className="mr-2 font-medium">{post.area_ar}</span>
                </div>
              </div>

              {post.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 bg-gray-50 p-3 rounded-lg">
                  {post.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                <Link
                  to={`/user/${post.user_id}`}
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline font-medium bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                >
                  بواسطة {post.username}
                </Link>

                <div className="flex space-x-reverse space-x-3">
                  <Link
                    to={`/post/${post.id}`}
                    className="text-sm text-emerald-600 hover:text-emerald-800 font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 rounded-lg border border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    التفاصيل
                  </Link>

                  <button
                    onClick={() => handleMatch(post.id)}
                    disabled={isButtonDisabled(post)}
                    className={`text-sm px-4 py-1.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 ${
                      post.type === "HAVE"
                        ? isButtonDisabled(post)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                        : isButtonDisabled(post)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
