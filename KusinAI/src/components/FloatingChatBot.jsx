/*
  File: src/components/FloatingChatBot.jsx
  Purpose: Floating chat widget component for quick AI/user assistance.
  Responsibilities:
  - Toggleable chat UI anchored on the page.
  - Bridge to chat APIs/services and display messages.
  Notes: Keep network calls abstracted for testability.
*/
// src/components/FloatingChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiMessageCircle, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = import.meta.env.VITE_API_URL;

const FloatingChatBot = ({ recipe }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/chat/${recipe?._id || "general"}`,
        {
          message: input,
          recipeContext: recipe
            ? `Title: ${recipe.title}\nIngredients: ${recipe.ingredients?.join(", ")}\nSteps: ${recipe.steps?.join(", ")}`
            : "General cooking knowledge",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMessage = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("❌ Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I had trouble processing that request." },
      ]);
    } finally {
      setIsThinking(false);
    }

    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center bg-yellow-500 text-white px-4 py-2">
            <h2 className="font-bold">KusinAI Assistant</h2>
            <button onClick={() => setIsOpen(false)}>
              <FiX size={20} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex transition-all duration-300 ${msg.sender === "user" ? "justify-end animate-slideInRight" : "justify-start animate-slideInLeft"
                  }`}
              >
                <div
                  key={idx}
                  className={`p-2 rounded prose max-w-full ${msg.sender === "user"
                      ? "bg-yellow-100 self-end text-right"
                      : "bg-gray-50 self-start text-left"
                    }`}
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator (typing dots) */}
            {isThinking && (
              <div className="flex justify-start animate-slideInLeft">
                <div className="px-3 py-2 rounded-lg bg-white border text-gray-500 text-sm flex items-center gap-1 shadow">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 bg-white border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Ask about this recipe..."
            />
            <button
              onClick={sendMessage}
              disabled={isThinking}
              className={`px-4 py-2 rounded-lg text-sm shadow ${isThinking
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center animate-pulse"
        >
          <FiMessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default FloatingChatBot;
