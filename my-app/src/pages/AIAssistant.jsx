import { useState } from "react";
import { Send } from "lucide-react";

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Hello, I’m your AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { role: "user", text: input },
      { role: "assistant", text: "🤔 Hmm… I'm thinking about that!" },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#f8f1e4] flex justify-center items-center py-10 px-4 text-[#4a3c28]">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-[#e5d3b3] flex flex-col">
        {/* Header */}
        <div className="bg-[#e5d3b3] px-5 py-3 text-[#4a3c28] font-semibold rounded-t-2xl flex justify-between items-center">
          🤖 AI Assistant
          <span className="text-sm opacity-80">Always here for you</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto h-[400px] space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl max-w-[75%] ${
                msg.role === "assistant"
                  ? "bg-[#f8f1e4] border border-[#e5d3b3] self-start"
                  : "bg-[#e5d3b3] self-end text-[#4a3c28]"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center border-t border-[#e5d3b3] p-3 bg-[#faf4eb] rounded-b-2xl">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-2 border border-[#e5d3b3] rounded-lg bg-[#fffaf0] outline-none"
          />
          <button
            onClick={handleSend}
            className="ml-3 bg-[#d8b888] hover:bg-[#c9a773] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
