import { useState, useEffect, useRef } from "react";

// The Gemini API URL. This is where your backend server (e.g., Node.js Express)
// should be running and accessible. This app will send user messages to this endpoint
// to get AI responses.
const GEMINI_API_URL = "http://localhost:3000/api/ai/chat"; // Adjust if your API is hosted elsewhere

function ChatBox() {
  // Renamed from App to ChatBox
  const [message, setMessage] = useState("");
  // chatHistory will now only store messages for the current session,
  // as Firebase Firestore is no longer used for persistence.
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef(null); // Ref for scrolling to the latest message

  // Effect to scroll to the bottom of the chat window whenever chatHistory updates
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending a new message
  const handleSend = async () => {
    // Basic validation: ensure the message is not just empty spaces
    if (!message.trim()) {
      setErrorMessage("Message cannot be empty.");
      return;
    }

    setLoading(true); // Indicate that a message is being sent
    setErrorMessage(""); // Clear any previous error messages

    try {
      // Create an optimistic update for the chat history, showing the user's message immediately
      const newUserMessage = {
        userMessage: message,
        aiResponse: "Typing...", // Placeholder for AI response
        timestamp: new Date(),
        id: Date.now(), // Simple unique ID for the key prop
      };
      // Add the user's message to the history. The AI's reply will update this entry later.
      setChatHistory((prev) => [...prev, newUserMessage]);
      setMessage(""); // Clear the input field immediately

      // Send the user's message to the backend API to get an AI response
      const res = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ Shart!
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: newUserMessage.userMessage }),
      });

      // Check if the API response was successful
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server API Error:", errorText);
        setErrorMessage(`Server error: ${res.status} - ${errorText}`);

        // If there's an error, revert the optimistic update or mark it as failed
        setChatHistory((prev) =>
          prev.map((chat) =>
            chat.id === newUserMessage.id
              ? {
                  ...chat,
                  aiResponse: `AI error: ${res.status} - ${errorText}`,
                }
              : chat
          )
        );
        return;
      }

      // Parse the JSON response from the API
      const data = await res.json();
      const aiReply = data.response || "AI javob topilmadi"; // Get AI's reply or a fallback message

      // Update the optimistic entry with the actual AI response
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === newUserMessage.id
            ? { ...chat, aiResponse: aiReply }
            : chat
        )
      );
    } catch (err) {
      // Catch any network or other unexpected errors
      console.error("Error sending message:", err);
      setErrorMessage("Failed to send message: " + err.message);

      // If an error occurred, remove the optimistic message or mark it failed
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === newUserMessage.id
            ? { ...chat, aiResponse: `Error: ${err.message}` }
            : chat
        )
      );
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div
      className="flex flex-col overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300"
      style={{ width: "34 0px", height: "500px" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-200 dark:bg-blue-800/50 rounded-xl"></div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/70">
        {chatHistory.length === 0 && !loading && !errorMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-100 dark:bg-gray-800 p-3 rounded-full mb-2">
              <svg
                className="w-6 h-6 text-blue-500 dark:text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Biror savol yozing, men yordam beraman!
            </p>
          </div>
        )}

        {chatHistory.map((chat, idx) => (
          <div key={chat.id || idx} className="space-y-1 animate-fade-in">
            {/* User */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-xl px-4 py-2 max-w-[75%] text-sm shadow-sm">
                {chat.userMessage}
              </div>
            </div>
            {/* AI */}
     {/* AI javobi + Nusxalash tugmasi pastda */}
<div className="flex justify-start">
  <div className="relative group bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2 max-w-[75%] text-sm shadow-sm">
    <p className="whitespace-pre-line">{chat.aiResponse}</p>

    {/* Nusxalash tugmasi pastki o‘ngda */}
    <button
      onClick={() => navigator.clipboard.writeText(chat.aiResponse)}
      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-xs"
      title="Nusxalash"
    >
      📋 Nusxalash
    </button>
  </div>
</div>


          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-xs border-t border-red-100 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800/50 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Xabaringizni yozing..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className={`p-2 rounded-lg transition ${
              loading || !message.trim()
                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
