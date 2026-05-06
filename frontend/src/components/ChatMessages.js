import { useEffect, useRef } from "react";

export default function ChatMessages({ messages, isTyping, retryLastMessage }) {

  const messagesEndRef = useRef(null);

  // autoscrolling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="messages">

      {messages.map((msg, index) => {
        const isLast = index === messages.length - 1;

        return (
          <div
            key={index}
            className={msg.role === "user" ? "user-msg" : "bot-msg"}
          >
            {msg.content}

            {/* Retry button if error */}
            {msg.retry && (
              <button
                className="retry-btn"
                onClick={retryLastMessage}
              >
                Retry
              </button>
            )}

            {/* Typing cursor */}
            {isLast && isTyping && <span className="cursor">|</span>}
          </div>
        );
      })}

      <div ref={messagesEndRef} />

    </div>
  );
}