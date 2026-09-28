import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const BACKEND_URL = "https://helpdesk-ticketing-system-le0p.onrender.com";

const socket = io(BACKEND_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true
});

const ChatSection = ({ ticketId, currentUser }) => {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const scrollRef = useRef();


  const sendMessage = async () => {
    if (message.trim() !== "") {
      const messageData = {
        room: ticketId,    // This targets the specific User's room
        author: currentUser,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      socket.emit("send_message", messageData);
      
      setMessage("");
    }
  };


  useEffect(() => {
    setMessageList([]); 

    socket.emit("register_user", currentUser); 

    socket.emit("join_room", ticketId);

    socket.on("chat_history", (history) => {
      setMessageList(history);
    });

    const handleReceiveMessage = (data) => {
      if (data.room === ticketId) {
        setMessageList((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("chat_history");
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [ticketId, currentUser]);

  
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <div className="flex flex-col h-[600px] w-full max-w-5xl bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mx-auto mt-4">
      {/* Header */}
      <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
        <h4 className="font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Chatting with: {ticketId}
        </h4>
        <span className="text-xs opacity-60">User: {currentUser}</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4 mt-7">
        {messageList.map((msg, index) => {
          const isMe = msg.author === currentUser;
          return (
            <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border text-gray-800 rounded-bl-none"
              }`}>
                <p className="text-[10px] font-bold uppercase mb-1 opacity-50">
                  {msg.author === "Admin" ? "IT Support" : msg.author}
                </p>
                <p className="text-sm">{msg.text}</p>
                <span className="text-[9px] block mt-1 text-right opacity-50">{msg.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t flex gap-2 bg-white">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={sendMessage} 
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
