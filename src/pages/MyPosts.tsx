import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { Post } from "../types";
import { useToast } from "../contexts/ToastContext";

export default function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/my/posts");
      setPosts(response);
    } catch (err: any) {
      setError(err.message || "فشل جلب منشوراتك");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (postId: number) => {
    if (confirm("هل أنت متأكد من إكمال هذا المنشور؟")) {
      try {
        await api.patch(`/posts/${postId}/complete`);
        showSuccess("تم إكمال المنشور بنجاح! شكراً لك على مساعدتك.");
        fetchMyPosts(); // إعادة تحميل المنشورات
      } catch (error: any) {
        showError(error.message || "فشل إكمال المنشور");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg max-w-md mx-auto">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">منشوراتي</h1>
        <Link to="/new" className="btn-primary">
          إنشاء منشور جديد
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد منشورات
          </h3>
          <p className="text-gray-500 mb-4">
            ابدأ بإنشاء أول منشور لك لمساعدة الآخرين أو طلب المساعدة
          </p>
          <Link to="/new" className="btn-primary">
            إنشاء منشور جديد
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.type === "HAVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {post.type_ar}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === "active"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {post.status === "active" ? "نشط" : "مكتمل"}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {post.item_name}
              </h3>

              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">الكمية:</span>
                  <span className="mr-2">{post.quantity}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">الفئة:</span>
                  <span className="mr-2">{post.category_ar}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">المنطقة:</span>
                  <span className="mr-2">{post.area_ar}</span>
                </div>
              </div>

              {post.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {post.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>#{post.id}</span>
                <span>
                  {new Date(post.created_at).toLocaleDateString("ar-SA")}
                </span>
              </div>

              <div className="flex space-x-reverse space-x-2">
                <Link
                  to={`/post/${post.id}`}
                  className="flex-1 text-center text-sm text-green-600 hover:text-green-800 py-2 border border-green-600 rounded-lg hover:bg-green-50"
                >
                  عرض التفاصيل
                </Link>

                {post.status === "active" && (
                  <button
                    onClick={() => handleComplete(post.id)}
                    className="flex-1 text-sm bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                  >
                    تم الإكمال 🤍
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
