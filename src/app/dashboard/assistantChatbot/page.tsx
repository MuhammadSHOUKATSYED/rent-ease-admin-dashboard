"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";

export default function AssistantChatbotPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ type: "user" | "bot"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessages = [...messages, { type: "user", text: message }];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5052/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setMessages([...newMessages, { type: "bot", text: data.answer }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { type: "bot", text: "⚠️ Failed to get response from chatbot." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">RentEaseAsk</h1>

      <div className="h-[450px] overflow-y-auto mb-4 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} mb-3`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-[75%] text-sm leading-relaxed ${
                msg.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-500 italic">Assistant is typing...</div>
        )}
      </div>

      <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 shadow-sm">
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
}