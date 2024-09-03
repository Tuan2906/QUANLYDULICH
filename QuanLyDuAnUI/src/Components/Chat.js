import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
  where,
  or,
} from "firebase/firestore";
import { firestore } from "./firebaseConfig";
import cookies from "react-cookies";

const Chat = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const flatListRef = useRef(null);
  const isNhanVien = localStorage.getItem("isStaff");
  // const currentUser = JSON.parse(localStorage.getItem("user"));
  var currentUser = null;
  if (isNhanVien === "true")
    currentUser = JSON.parse(localStorage.getItem("user"));
  else currentUser = cookies.load("user");

  useEffect(() => {
    const q = query(
      collection(firestore, "messages"),
      where("conversationId", "==", conversationId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMessages(msgs);
      console.log(msgs);
      if (flatListRef.current) {
        flatListRef.current.scrollTop = flatListRef.current.scrollHeight;
      }
    });

    // Dọn dẹp subscription khi component unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollTop = flatListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      const newMessageObj = {
        text: newMessage,
        senderId: currentUser.id,
        conversationId: conversationId,
        timestamp: Timestamp.fromDate(new Date()), // Sử dụng Timestamp từ Firebase
      };
      await addDoc(collection(firestore, "messages"), newMessageObj);

      // Cập nhật tin nhắn mới nhất trong cuộc trò chuyện
      const conversationRef = doc(firestore, "conversations", conversationId);
      await updateDoc(conversationRef, {
        latestMessage: newMessage,
        latestTime: new Date().toLocaleTimeString(),
      });

      setNewMessage("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div
        ref={flatListRef}
        style={{
          overflowY: "auto",
          flex: 1,
          padding: "10px",
          border: "1px solid #ddd",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "gray" }}>
            No messages yet. Start the conversation!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {messages.length === 0 ? (
              <p style={{ textAlign: "center", color: "gray" }}>
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    borderRadius: "5px",
                    backgroundColor:
                      msg.senderId === currentUser.id ? "#007bff" : "#ddd",
                    color: msg.senderId === currentUser.id ? "#fff" : "#333",
                    alignSelf:
                      msg.senderId === currentUser.id
                        ? "flex-end"
                        : "flex-start",
                    maxWidth: "70%",
                  }}
                >
                  <img
                    src={
                      msg.senderId === currentUser.id
                        ? currentUser.avatar
                        : msg.avatar
                    } // Adjusted to show sender's avatar
                    alt="User Avatar"
                    style={{
                      width: "40px", // Set the avatar size
                      height: "40px",
                      borderRadius: "50%", // Make it circular
                      marginLeft:
                        msg.senderId === currentUser.id ? "10px" : "0", // Adjust spacing based on the message direction
                      marginRight:
                        msg.senderId === currentUser.id ? "0" : "10px", // Adjust spacing based on the message direction
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <p style={{ margin: 0 }}>{msg.text}</p>
                    <small>{msg.timestamp.toDate().toLocaleTimeString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ddd",
          backgroundColor: "#fff",
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "10px",
            marginLeft: "5px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
