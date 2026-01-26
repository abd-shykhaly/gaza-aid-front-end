import { useEffect, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";

interface NotificationData {
  type: "new_helper" | "post_completed" | "match_received";
  message: string;
  postId?: number;
  helperUsername?: string;
}

export const useRealtimeNotifications = () => {
  const { showSuccess, showInfo } = useToast();

  const handleNotification = useCallback(
    (data: NotificationData) => {
      switch (data.type) {
        case "new_helper":
          showInfo(`شخص جديد يريد المساعدة: ${data.helperUsername}`, 6000);
          break;
        case "post_completed":
          showSuccess(`تم إكمال المنشور #${data.postId} بنجاح!`, 5000);
          break;
        case "match_received":
          showSuccess(`شخص جديد سجل للمساعدة في منشورك!`, 5000);
          break;
        default:
          showInfo(data.message);
      }
    },
    [showSuccess, showInfo],
  );

  // Simulate real-time notifications (in production, use WebSocket or Server-Sent Events)
  useEffect(() => {
    const interval = setInterval(() => {
      // This would be replaced with actual WebSocket/SSE connection
      // For now, we'll just check for updates periodically
      const checkForNotifications = async () => {
        try {
          // In a real implementation, this would connect to WebSocket
          // or use Server-Sent Events to get real-time updates
          console.log("Checking for new notifications...");
        } catch (error) {
          console.error("Error checking notifications:", error);
        }
      };

      checkForNotifications();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Mock function to trigger notifications (for testing)
  const triggerNotification = useCallback(
    (data: NotificationData) => {
      handleNotification(data);
    },
    [handleNotification],
  );

  return {
    triggerNotification,
  };
};
