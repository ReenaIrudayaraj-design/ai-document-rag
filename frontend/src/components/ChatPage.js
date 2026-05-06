import { useState, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChatPage() {

    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [lastUserMessage, setLastUserMessage] = useState("");
    const [sessionId, setSessionId] = useState("");

    // Create / load session
    useEffect(() => {
        let existingSession = localStorage.getItem("chatSession");
        if (!existingSession) {
            existingSession = crypto.randomUUID();
            localStorage.setItem("chatSession", existingSession);
        }
        setSessionId(existingSession);
        const savedMessages = localStorage.getItem(`chatHistory-${existingSession}`);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, []);

    // Save chat history in local storage
    useEffect(() => {
        if (!sessionId) return;
        localStorage.setItem(
            `chatHistory-${sessionId}`,
            JSON.stringify(messages)
        );
    }, [messages, sessionId]);


    const sendMessage = async (text, isRetry = false) => {

        if (!text.trim()) return;

        setIsTyping(true);
        setLastUserMessage(text);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 sec timeout

        try {

            let newMessages = [...messages];

            if (!isRetry) {
                newMessages = [
                    ...messages,
                    { role: "user", content: text },
                    { role: "assistant", content: "" }
                ];
            }

            setMessages(newMessages);

            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text, sessionId: sessionId }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error("Server error");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = fullText;
                    return updated;
                });
            }
        } catch (error) {
            let errorMessage = "Something went wrong.";

            if (error.name === "AbortError") {
                errorMessage = "Request timed out. Please retry.";
            }
            else if (error.message === "Server error") {
                errorMessage = "Server error occurred.";
            }
            else {
                errorMessage = "Network error. Check your connection.";
            }

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: errorMessage,
                    retry: true
                }
            ]);

            console.error("Chat API error:", error);

        } finally {
            setIsTyping(false);
        }
    };

    const retryLastMessage = () => {
        sendMessage(lastUserMessage, true);
    };

    const clearChat = () => {
        const newSession = crypto.randomUUID();
        localStorage.removeItem(`chatHistory-${sessionId}`);
        localStorage.setItem("chatSession", newSession);
        setSessionId(newSession);
        setMessages([]);
    };

    // Typewriter effect for bot response -removed in favor of streaming response, but can be used if API doesn't support streaming
    //   const typeWriter = async (textChunk) => {

    //     for (let char of textChunk) {

    //       setMessages(prev => {
    //         const updated = [...prev];
    //         const lastIndex = updated.length - 1;

    //         updated[lastIndex].content += char;

    //         return updated;
    //       });

    //       await new Promise(res => setTimeout(res, 15));
    //     }
    //   };

    return (
        <div className="chat-container">

            <h2 className="header">AI Chat</h2>

            <button className="clear-btn" onClick={clearChat}>
                Clear Chat
            </button>

            <ChatMessages
                messages={messages}
                isTyping={isTyping}
                retryLastMessage={retryLastMessage}
            />

            <ChatInput sendMessage={sendMessage} isTyping={isTyping} />

            <ToastContainer position="top-right" autoClose={6000} />

        </div>
    );
}