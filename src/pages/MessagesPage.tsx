import { useState } from "react";
import { Search, Send, MoreVertical, ChevronLeft, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  productTitle?: string;
  productImage?: string;
  status: "waiting" | "inprogress" | "completed" | "archived";
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "김철수",
    avatar: "",
    lastMessage: "네, 한밭대 정문에서 만나요!",
    timestamp: "2분 전",
    unread: 2,
    productTitle: "MacBook Pro 16인치",
    productImage: "https://images.unsplash.com/photo-1551533390-b80b6ffa7816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwcHJvJTIwbGFwdG9wfGVufDF8fHx8MTc3NDkwOTI4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "inprogress",
  },
  {
    id: "2",
    name: "이영희",
    avatar: "",
    lastMessage: "가격 조금 낮춰주실 수 있나요?",
    timestamp: "1시간 전",
    unread: 0,
    productTitle: "Nike 에어포스 1",
    productImage: "https://images.unsplash.com/photo-1637744360335-4df6d1d5ecf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWtlJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3NzQ5NTM0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    status: "waiting",
  },
  {
    id: "3",
    name: "박민수",
    avatar: "",
    lastMessage: "사진 더 보내주실 수 있나요?",
    timestamp: "3시간 전",
    unread: 1,
    productTitle: "아이패드 에어 5세대",
    productImage: "https://images.unsplash.com/photo-1561154464-82e9adf32764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGFkJTIwdGFibGV0JTIwZGV2aWNlfGVufDF8fHx8MTc3NDkwOTI4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "completed",
  },
];

const mockMessages = [
  {
    id: "1",
    senderId: "other",
    text: "안녕하세요, 이 제품 아직 판매 중이신가요?",
    timestamp: "오후 2:30",
  },
  {
    id: "2",
    senderId: "me",
    text: "네, 아직 판매 중입니다!",
    timestamp: "오후 2:32",
  },
  {
    id: "3",
    senderId: "other",
    text: "한밭대 정문에서 직거래 가능한가요?",
    timestamp: "오후 2:33",
  },
  {
    id: "4",
    senderId: "me",
    text: "네, 한밭대 정문에서 만나요!",
    timestamp: "오후 2:35",
  },
  {
    id: "5",
    senderId: "other",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1551533390-b80b6ffa7816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwcHJvJTIwbGFwdG9wfGVufDF8fHx8MTc3NDkwOTI4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    timestamp: "오후 2:36",
  },
];

export function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message logic here
      setMessage("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        // Here you would normally send the image to the server
        // For now, we'll just log it
        // In a real app, add this to messages
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedChatData = mockChats.find((chat) => chat.id === selectedChat);

  return (
    <div className="min-h-screen bg-white pt-[80px]">
      <div className="mx-auto h-[calc(100vh-80px)]">
        <div className="flex h-full border-x border-gray-200">
          {/* Chat List */}
          <div className="w-[300px] sm:w-[360px] border-r border-gray-200 flex-shrink-0">

            {/* Chat List */}
            <div className="overflow-y-auto h-full">
              {mockChats.length > 0 ? (
                mockChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedChat === chat.id ? "bg-gray-50" : ""
                    }`}
                  >
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {chat.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {chat.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {chat.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {chat.unread}
                            </span>
                          )}
                          {chat.productImage && (
                            <img
                              src={chat.productImage}
                              alt={chat.productTitle}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center justify-between">
                        {chat.productTitle && (
                          <span className="text-xs text-gray-400">
                            {chat.productTitle}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {chat.timestamp}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <p className="text-gray-500 text-sm">해당하는 메시지가 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          {selectedChat ? (
            <div className="flex flex-col h-full flex-1">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChatData?.avatar} />
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      {selectedChatData?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {selectedChatData?.name}
                    </div>
                    {selectedChatData?.productTitle && (
                      <div className="text-xs text-gray-500">
                        {selectedChatData.productTitle}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        msg.senderId === "me"
                          ? "bg-[#6BCF7F] text-white"
                          : "bg-white text-gray-900"
                      } rounded-2xl px-4 py-2 shadow-sm`}
                    >
                      {msg.type === "image" ? (
                        <img
                          src={msg.imageUrl}
                          alt="Message Image"
                          className="w-full h-auto"
                        />
                      ) : (
                        <p className="text-sm">{msg.text}</p>
                      )}
                      <span
                        className={`text-xs mt-1 block ${
                          msg.senderId === "me"
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 h-11 border-gray-300"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-[#6BCF7F] hover:bg-[#5ABD6D] text-white h-11 px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  메시지를 선택하세요
                </h3>
                <p className="text-gray-500">
                  대화를 시작하려면 채팅을 선택하세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
