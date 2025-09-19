import { useState, useEffect, useRef, useCallback } from "react";

export default function Chat({ onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const endRef = useRef(null);

  const specialReplies = [
    { patterns: [/^who made u\??$/i], reply: "Durba Banerjee" },
    { patterns: [/^what\s*(is|'?s)?\s*(your|ur)\s*(name|anme)\??$/i], reply: "AdGpt" },
  ];

  const fetchConvos = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      const normalized = data.map((c) => ({ ...c, id: c._id || c.id }));
      setConversations(normalized);
      if (normalized.length > 0 && !activeChat) {
        setActiveChat(normalized[0].id);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  }, [activeChat]);

  useEffect(() => {
    fetchConvos();
  }, [fetchConvos]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, conversations, loading]);

  const currentChat = conversations.find((c) => c.id === activeChat);

  const sendMessage = async () => {
    if ((!input.trim() && !file) || !currentChat) return;
    setLoading(true);

    const userMsg = { role: "user", text: input, file: file ? file.name : null };
    const updatedConvos = conversations.map((chat) =>
      chat.id === activeChat ? { ...chat, messages: [...chat.messages, userMsg] } : chat
    );
    setConversations(updatedConvos);

    for (const item of specialReplies) {
      if (item.patterns.some((regex) => regex.test(input.trim()))) {
        const updatedWithResponse = updatedConvos.map((chat) =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, { role: "assistant", text: item.reply }] }
            : chat
        );
        setConversations(updatedWithResponse);
        setInput("");
        setFile(null);
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("conversationId", activeChat);
      formData.append("message", input);
      if (file) formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/send-message`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { reply, conversationId, fileUrl } = await res.json();

      const updatedWithResponse = updatedConvos.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              id: conversationId,
              messages: [
                ...chat.messages,
                { role: "assistant", text: reply, file: fileUrl || null },
              ],
            }
          : chat
      );
      setConversations(updatedWithResponse);

      if (!activeChat && conversationId) {
        setActiveChat(conversationId);
      }
    } catch (err) {
      console.error("API Error:", err);
    }

    setInput("");
    setFile(null);
    setLoading(false);
  };

  const addNewChat = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: `Chat ${conversations.length + 1}` }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      await fetchConvos();
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };

  const deleteChat = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
      await fetchConvos();
      if (activeChat === id) setActiveChat(null);
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  return (
    <div className="fixed inset-0 h-screen flex flex-row overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600">
      {/* Sidebar (mobile = overlay, desktop = fixed) */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-800 flex flex-col shadow-lg transform transition-transform duration-300 z-30
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-3 flex justify-between items-center bg-gray-900">
          <h2 className="text-base md:text-xl font-semibold text-white">AdGPT</h2>
          <button
            className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white text-xs font-medium"
            onClick={addNewChat}
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {conversations.map((chat) => {
            const userMessages = (chat.messages || []).filter((m) => m.role === "user");
            let displayTitle = chat.title || "New chat";

            if (userMessages.length >= 2) {
              displayTitle =
                (userMessages[1].text || "").slice(0, 20) +
                ((userMessages[1].text || "").length > 20 ? "..." : "");
            } else if ((chat.messages || []).length > 0) {
              displayTitle =
                (chat.messages[0].text || "").slice(0, 20) +
                ((chat.messages[0].text || "").length > 20 ? "..." : "");
            }

            return (
              <div key={chat.id} className="flex items-center justify-between px-2 py-1">
                <button
                  className={`text-left flex-1 p-2 truncate ${
                    activeChat === chat.id
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => {
                    setActiveChat(chat.id);
                    setSidebarOpen(false); // auto close on mobile
                  }}
                >
                  {displayTitle}
                </button>
                <button
                  className="text-red-500 text-xs font-semibold px-1"
                  onClick={() => deleteChat(chat.id)}
                >
                  Del
                </button>
              </div>
            );
          })}
        </div>

        <div className="shrink-0">
          <button
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay background for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Column */}
      <main className="flex-1 flex flex-col bg-gray-900 min-h-0 relative">
        {/* Top bar with hamburger (only mobile) */}
        <div className="md:hidden flex items-center justify-between bg-gray-900 px-3 py-2 border-b border-gray-700">
          <button
            className="text-white text-xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h2 className="text-white font-semibold">Chat</h2>
          <div className="w-6" /> {/* spacer */}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 min-h-0">
          {(currentChat?.messages || []).map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`mb-2 flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-3 py-2 text-xs sm:text-sm max-w-[75%] sm:max-w-[60%] whitespace-pre-wrap break-words shadow ${
                    isUser
                      ? "bg-blue-500 text-white rounded-2xl rounded-br-md mr-1"
                      : "bg-gray-700 text-gray-100 rounded-2xl rounded-bl-md ml-1"
                  }`}
                >
                  {msg.text}
                  {msg.file && (
                    <div className="mt-1 text-[10px] sm:text-xs">
                      📎{" "}
                      <a
                        href={`${import.meta.env.VITE_API_URL}${msg.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-300"
                      >
                        {msg.file.split("/").pop()}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="mb-2 flex justify-start">
              <div className="ml-1 rounded-2xl px-3 py-2 bg-gray-700 text-gray-300 animate-pulse max-w-[55%] text-xs">
                Thinking...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <div className="sticky bottom-0 z-20 bg-gray-800 border-t border-gray-700 px-2 sm:px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 h-9 sm:h-10 px-2 sm:px-3 rounded-lg bg-gray-700 text-xs sm:text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Emoji */}
          <div className="relative">
            <button
              className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-lg sm:text-xl"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              😀
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 bg-gray-700 p-3 rounded-lg grid grid-cols-6 gap-2 w-52 sm:w-64">
                {["😀","😂","😍","😎","😢","🔥","❤️","👍","🙏","🎉","😴","🤔","🥳","💯"].map((emoji) => (
                  <button
                    key={emoji}
                    className="text-lg sm:text-xl"
                    onClick={() => {
                      setInput((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice */}
          <button
            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-lg sm:text-xl"
            onClick={() => window.open("https://aivie.netlify.app/", "_blank")}
          >
            🎤
          </button>

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={loading || !activeChat}
            className="h-9 sm:h-10 min-w-[60px] sm:min-w-[70px] px-3 sm:px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
