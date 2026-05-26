import { motion, AnimatePresence } from "motion/react";
import { X, Bell, MessageCircle, Heart, TrendingUp, Package, Clock, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: "bid" | "message" | "like" | "sold" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
}

const notifications: Notification[] = [];

export function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "bid":
        return <Gavel className="w-5 h-5 text-white" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case "like":
        return <Heart className="w-5 h-5 text-red-400" />;
      case "sold":
        return <Package className="w-5 h-5 text-purple-400" />;
      case "system":
        return <Bell className="w-5 h-5 text-gray-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#111111] shadow-2xl z-[70] overflow-hidden flex flex-col border-l border-[#2A2A2A]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                  <Bell className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-[#2A2A2A]">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 hover:bg-[#1A1A1A] cursor-pointer transition-colors ${
                        !notification.isRead ? "bg-[#1A1A1A]" : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                          notification.type === "bid" ? "bg-white/10" :
                          notification.type === "message" ? "bg-blue-500/10" :
                          notification.type === "like" ? "bg-red-500/10" :
                          notification.type === "sold" ? "bg-purple-500/10" :
                          "bg-gray-500/10"
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3
                              className={`text-sm font-semibold ${
                                !notification.isRead ? "text-white" : "text-gray-300"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2A2A2A] bg-black">
              <Button
                variant="ghost"
                className="w-full text-white hover:bg-[#2A2A2A] font-semibold"
              >
                Mark all as read
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
