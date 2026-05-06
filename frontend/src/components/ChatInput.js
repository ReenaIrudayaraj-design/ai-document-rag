import { useState } from "react";
import DocumentUpload from "./DocumentUpload";

export default function ChatInput({ sendMessage, isTyping }) {

  const [input, setInput] = useState("");

  const handleSend = () => {

    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  return (
    <div className="input-area">
        <DocumentUpload/>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
        disabled={isTyping}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />

      <button onClick={handleSend} disabled={isTyping}>
        Send
      </button>

    </div>
  );
}