import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { createChatSocket } from "@/lib/chatSocket";
import type { ChatMessageResponse } from "@/types/api";

type MessageListener = (message: ChatMessageResponse) => void;

interface ChatContextType {
  hasNewMessage: boolean;
  reconnectVersion: number;
  clearNewMessage: () => void;
  setMessagesPageActive: (active: boolean) => void;
  subscribe: (listener: MessageListener) => () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userId } = useAuth();
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [reconnectVersion, setReconnectVersion] = useState(0);
  const listenersRef = useRef(new Set<MessageListener>());
  const messagesPageActiveRef = useRef(false);

  const clearNewMessage = useCallback(() => setHasNewMessage(false), []);

  const setMessagesPageActive = useCallback((active: boolean) => {
    messagesPageActiveRef.current = active;
    if (active) setHasNewMessage(false);
  }, []);

  const subscribe = useCallback((listener: MessageListener) => {
    listenersRef.current.add(listener);
    return () => { listenersRef.current.delete(listener); };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setHasNewMessage(false);
      return;
    }

    const client = createChatSocket(
      (message) => {
        listenersRef.current.forEach((listener) => listener(message));
        if (message.sender_id !== userId && !messagesPageActiveRef.current) {
          setHasNewMessage(true);
        }
      },
      undefined,
      (reconnected) => {
        if (reconnected) setReconnectVersion((version) => version + 1);
      }
    );

    client.activate();
    return () => { void client.deactivate(); };
  }, [isAuthenticated, userId]);

  const value = useMemo(() => ({
    hasNewMessage,
    reconnectVersion,
    clearNewMessage,
    setMessagesPageActive,
    subscribe,
  }), [hasNewMessage, reconnectVersion, clearNewMessage, setMessagesPageActive, subscribe]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
}
