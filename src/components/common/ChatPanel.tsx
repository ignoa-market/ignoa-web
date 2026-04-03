import { useState, useRef, useEffect } from "react";
import { X, Send, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  text: string;
  mine: boolean;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  product: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: "c1",
    name: "빈티지러버",
    product: "MacBook Pro 16인치 M1",
    lastMessage: "혹시 직거래 가능하신가요?",
    time: "2분 전",
    unread: 2,
    messages: [
      { id: "m1", text: "안녕하세요! MacBook Pro 아직 판매 중인가요?", mine: false, time: "14:20" },
      { id: "m2", text: "네, 아직 판매 중입니다.", mine: true, time: "14:21" },
      { id: "m3", text: "혹시 직거래 가능하신가요?", mine: false, time: "14:23" },
    ],
  },
  {
    id: "c2",
    name: "스트릿웨어킹",
    product: "아이패드 에어 5세대",
    lastMessage: "최저가 얼마까지 가능하세요?",
    time: "1시간 전",
    unread: 0,
    messages: [
      { id: "m1", text: "아이패드 상태 어떤가요?", mine: false, time: "13:10" },
      { id: "m2", text: "개봉 후 한 달 사용, 흠집 없습니다.", mine: true, time: "13:12" },
      { id: "m3", text: "최저가 얼마까지 가능하세요?", mine: false, time: "13:15" },
    ],
  },
  {
    id: "c3",
    name: "럭셔리헌터",
    product: "Nike 에어포스 1 화이트",
    lastMessage: "사이즈 270 있나요?",
    time: "어제",
    unread: 0,
    messages: [
      { id: "m1", text: "사이즈 270 있나요?", mine: false, time: "어제" },
    ],
  },
];

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const handleSend = () => {
    if (!input.trim() || !activeConv) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      text: input.trim(),
      mine: true,
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };
    const updated = conversations.map((c) =>
      c.id === activeConv.id
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, time: "방금" }
        : c
    );
    setConversations(updated);
    setActiveConv({ ...activeConv, messages: [...activeConv.messages, newMsg] });
    setInput("");
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
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {activeConv ? (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                onClick={() => setActiveConv(null)}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-black" />
              </motion.button>
            ) : null}
          </AnimatePresence>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase">
              {activeConv ? activeConv.product : "Messages"}
            </p>
            {activeConv && (
              <p className="text-base font-black text-black leading-tight">{activeConv.name}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!activeConv ? (
          /* Conversation List */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-y-auto"
          >
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pb-20">
                <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-300 uppercase">No messages</p>
              </div>
            ) : (
              conversations.map((conv, i) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  onClick={() => {
                    setActiveConv(conv);
                    setConversations((prev) =>
                      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
                    );
                  }}
                  className="w-full flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-black text-gray-400">
                    {conv.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold text-black">{conv.name}</span>
                      <span className="text-[10px] text-gray-400">{conv.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{conv.product}</p>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-white">{conv.unread}</span>
                    </div>
                  )}
                </motion.button>
              ))
            )}
          </motion.div>
        ) : (
          /* Message Thread */
          <motion.div
            key="thread"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {activeConv.messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[72%] ${msg.mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                      msg.mine
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="메시지를 입력하세요"
                  className="flex-1 h-11 px-4 bg-gray-50 text-sm text-black placeholder:text-gray-400 outline-none focus:bg-gray-100 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-11 h-11 bg-black flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
