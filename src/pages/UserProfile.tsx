import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useToast } from "../contexts/ToastContext";
import { authStorage } from "../utils/auth";
import ContactButton from "../components/ContactButton";
import FeedbackBadge from "../components/FeedbackBadge";

interface Post {
  id: number;
  item_name: string;
  type: string;
  type_ar: string;
  category_ar: string;
  quantity: string;
  area_ar: string;
  description?: string;
  status: string;
  created_at: string;
  username: string;
  user_id: number;
}

interface User {
  id: number;
  username: string;
  email?: string;
  created_at: string;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMatches, setUserMatches] = useState<number[]>([]);
  const { showSuccess, showError } = useToast();
  const currentUser = authStorage.getUser();
  const currentUserId = currentUser?.id || 0;

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserPosts();
      fetchUserMatches();
    }
  }, [userId]);

  const fetchUserMatches = async () => {
    try {
      const response = await api.get("/matches/my");
      const postIds = response.map((match: any) => match.post_id);
      setUserMatches(postIds);
    } catch (error) {
      console.error("Error fetching user matches:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}`);
      setUser(response);
    } catch (error: any) {
      showError(error.message || "فشل جلب بيانات المستخدم");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await api.get(`/posts?user_id=${userId}`);
      setPosts(response);
    } catch (error: any) {
      showError(error.message || "فشل جلب منشورات المستخدم");
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
      fetchUserPosts();

      // Navigate to the conversation
      navigate(`/messages/${conversationResponse.id}`);
    } catch (error: any) {
      showError(error.message || "فشل تسجيل المشاركة");
    }
  };

  const isButtonDisabled = (post: Post) => {
    const isOwner = post.user_id === currentUserId;
    const hasInteracted = userMatches.includes(post.id);
    return isOwner || hasInteracted;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg max-w-md mx-auto">
          المستخدم غير موجود
        </div>
        <button onClick={() => navigate("/")} className="mt-4 btn-secondary">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const isOwnProfile = user.id === currentUserId;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
      >
        ← العودة للرئيسية
      </button>

      {/* User Profile Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.username}
              </h1>
              <p className="text-gray-500">
                انضم في {new Date(user.created_at).toLocaleDateString("ar-SA")}
              </p>
            </div>
          </div>

          {!isOwnProfile && (
            <ContactButton
              postOwnerId={user.id}
              postOwnerUsername={user.username}
              className="px-6 py-2"
            />
          )}
        </div>
      </div>

      {/* User's Posts */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          منشورات {user.username}
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد منشورات لهذا المستخدم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-reverse space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (post.type as "HAVE" | "NEED") === "HAVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {post.type_ar}
                    </span>
                    <FeedbackBadge
                      postId={post.id}
                      postType={post.type as "HAVE" | "NEED"}
                      className="text-xs"
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString("ar-SA")}
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

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    بواسطة {post.username}
                  </span>

                  <div className="flex space-x-reverse space-x-2">
                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      التفاصيل
                    </button>

                    <button
                      onClick={() => handleMatch(post.id)}
                      disabled={isButtonDisabled(post)}
                      className={`text-sm px-3 py-1 rounded transition-colors ${
                        (post.type as "HAVE" | "NEED") === "HAVE"
                          ? isButtonDisabled(post)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white"
                          : isButtonDisabled(post)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {post.user_id === currentUserId
                        ? "منشورك"
                        : userMatches.includes(post.id)
                          ? "تم المشاركة"
                          : (post.type as "HAVE" | "NEED") === "HAVE"
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
    </div>
  );
}
