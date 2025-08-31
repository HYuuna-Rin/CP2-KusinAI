import React, { useState } from "react";
import { FaComments, FaTimes } from "react-icons/fa";

const FloatingChatBot = ({ recipeId, recipeTitle, recipeContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(`/api/chat/${recipeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input,
          recipeContext,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      console.error("Error talking to chatbot:", err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white shadow-lg rounded-lg w-80 h-96 flex flex-col">
          <div className="bg-orange-500 text-white flex justify-between items-center p-3 rounded-t-lg">
            <span>Ask KusinAI</span>
            <FaTimes className="cursor-pointer" onClick={toggleChat} />
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-xs ${
                  msg.sender === "user"
                    ? "bg-orange-100 self-end text-right"
                    : "bg-gray-200 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-gray-500 text-sm">Typing...</div>}
          </div>
          <div className="p-2 flex gap-2 border-t">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
            />
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 rounded"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg"
        >
          <FaComments className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default FloatingChatBot;
