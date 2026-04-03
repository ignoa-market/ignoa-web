import { X, Gavel, Heart, MessageCircle, Clock, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface Notification {
  id: string;
  type: "bid" | "wish" | "message" | "ending" | "sold";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: "n1", type: "bid",     title: "새로운 입찰",       body: "MacBook Pro 16인치에 새 입찰가 1,300,000원이 등록됐습니다.",  time: "3분 전",   read: false },
  { id: "n2", type: "ending",  title: "경매 마감 임박",    body: "아이패드 에어 5세대 경매가 30분 후 종료됩니다.",              time: "27분 전",  read: false },
  { id: "n3", type: "message", title: "새 메시지",         body: "빈티지러버 님이 메시지를 보냈습니다.",                        time: "1시간 전", read: false },
  { id: "n4", type: "wish",    title: "찜 알림",           body: "Nike 에어포스 1 화이트를 12명이 찜했습니다.",                 time: "3시간 전", read: true  },
  { id: "n5", type: "sold",    title: "낙찰 완료",         body: "소니 WH-1000XM4 헤드폰이 185,000원에 낙찰됐습니다.",         time: "어제",     read: true  },
  { id: "n6", type: "bid",     title: "입찰 경쟁",         body: "캐논 EOS M50에 다른 사용자가 입찰했습니다.",                  time: "어제",     read: true  },
];

const iconMap = {
  bid:     { icon: Gavel,         bg: "bg-black",      color: "text-white"     },
  wish:    { icon: Heart,         bg: "bg-gray-100",   color: "text-gray-700"  },
  message: { icon: MessageCircle, bg: "bg-gray-100",   color: "text-gray-700"  },
  ending:  { icon: Clock,         bg: "bg-black",      color: "text-white"     },
  sold:    { icon: Package,       bg: "bg-gray-100",   color: "text-gray-700"  },
};

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="fixed top-0 right-0 h-screen w-[420px] bg-white border-l border-gray-100 z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-5 border-b border-gray-100 flex-shrink-0">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-0.5">Notifications</p>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500">{unreadCount}개의 읽지 않은 알림</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 hover:text-black transition-colors"
            >
              모두 읽음
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors ml-2"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full pb-20">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-300 uppercase">No notifications</p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const { icon: Icon, bg, color } = iconMap[n.type];
              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-4 px-6 py-4 border-b border-gray-50 text-left transition-colors ${
                    n.read ? "hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-bold ${n.read ? "text-gray-600" : "text-black"}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{n.time}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${n.read ? "text-gray-400" : "text-gray-600"}`}>
                      {n.body}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-2" />
                  )}
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
