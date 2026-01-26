import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./contexts/ToastContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import MyPosts from "./pages/MyPosts";
import FeedbackHistory from "./pages/FeedbackHistory";
import Messages from "./pages/Messages";
import ConversationDetail from "./pages/ConversationDetail";
import UserProfile from "./pages/UserProfile";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="App" dir="rtl">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
          />

          <Route
            path="/"
            element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Feed />} />
            <Route path="new" element={<CreatePost />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="feedback" element={<FeedbackHistory />} />
            <Route path="messages" element={<Messages />} />
            <Route
              path="messages/:conversationId"
              element={<ConversationDetail />}
            />
            <Route path="user/:userId" element={<UserProfile />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
          />
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;
