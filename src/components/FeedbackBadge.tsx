import { useState, useEffect } from "react";
import { api } from "../utils/api";

interface Match {
  id: number;
  post_type: "HAVE" | "NEED";
  participant_role: string;
  action_type: string;
  username: string;
}

interface FeedbackBadgeProps {
  postId: number;
  postType?: "HAVE" | "NEED";
  className?: string;
}

export default function FeedbackBadge({
  postId,
  postType,
  className = "",
}: FeedbackBadgeProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [postId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/matches/post/${postId}`);
      setMatches(response);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeMessage = () => {
    if (matches.length === 0) return null;

    const count = matches.length;
    const postTypeToUse = postType || matches[0]?.post_type;

    if (!postTypeToUse) return null;

    if (postTypeToUse === "HAVE") {
      // For HAVE posts, people are NEEDING help
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span className="ml-1">🙋‍♂️</span>
          {count} {count === 1 ? "شخص يحتاج" : "أشخاص يحتاجون"}
        </span>
      );
    } else {
      // For NEED posts, people are OFFERING help
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="ml-1">🤝</span>
          {count} {count === 1 ? "شخص يساعد" : "أشخاص يساعدون"}
        </span>
      );
    }
  };

  if (loading || matches.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-reverse space-x-1 ${className}`}>
      {getBadgeMessage()}
    </div>
  );
}
