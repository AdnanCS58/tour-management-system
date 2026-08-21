"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiSend, FiMessageCircle } from "react-icons/fi";

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

interface TourChatProps {
  tourId: string;
  currentUserId: string;
  onMessagesRead?: () => void;
}

export default function TourChat({
  tourId,
  currentUserId,
  onMessagesRead,
}: TourChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [tourId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/tours/${tourId}/messages`);
      const data = await res.json();

      if (res.ok) {
        setMessages(data.messages || data);
        if (onMessagesRead) {
          onMessagesRead();
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);

    try {
      const res = await fetch(`/api/tours/${tourId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, data]);
        setNewMessage("");
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#2a322e] flex items-center">
        <FiMessageCircle className="text-emerald-400 mr-2" />
        <h3 className="font-semibold text-[#e8f0eb]">Group Chat</h3>
        <span className="ml-auto text-xs text-[#6b7a72]">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="p-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: "400px", minHeight: "300px" }}
      >
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <FiMessageCircle className="w-12 h-12 text-[#2a322e] mx-auto mb-4" />
            <p className="text-[#6b7a72]">No messages yet</p>
            <p className="text-sm text-[#6b7a72] mt-1">
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender?._id === currentUserId;

            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] ${isOwnMessage ? "order-2" : ""}`}>
                  {/* Sender Name */}
                  {!isOwnMessage && (
                    <p className="text-xs text-[#6b7a72] mb-1">
                      {message.sender?.name || "Unknown"}
                    </p>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-xl p-3 ${
                      isOwnMessage
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-[#1a211e] text-[#e8f0eb] rounded-bl-none border border-[#2a322e]"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>

                  {/* Time */}
                  <p
                    className={`text-xs text-[#6b7a72] mt-1 ${isOwnMessage ? "text-right" : ""}`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-[#2a322e] flex items-center space-x-3"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-xl text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-500 transition disabled:opacity-50 shadow-lg shadow-emerald-600/20"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
