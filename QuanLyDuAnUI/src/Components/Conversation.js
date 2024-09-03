import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "./firebaseConfig";
import cookies from "react-cookies";

// Đặt ảnh đại diện mặc định
const defaultAvatar = "https://via.placeholder.com/50x50.png?text=No+Avatar";

const Conversation = () => {
  const [conversations, setConversations] = useState([]);
  const isNhanVien = localStorage.getItem("isStaff");
  var currentUser = null;
  if (isNhanVien === "true")
    currentUser = JSON.parse(localStorage.getItem("user"));
  else currentUser = cookies.load("user");

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(firestore, "conversations"),
        where("participantIds", "array-contains", currentUser.id)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const convos = snapshot.docs.map((doc) => {
          const data = doc.data();
          const otherUserId = data.participantIds.find(
            (userId) => userId !== currentUser
          ); // Lấy ID của người dùng khác trong cuộc trò chuyện
          return {
            id: doc.id,
            ...data,
            avatar: data.avatar || defaultAvatar, // Sử dụng avatar mặc định nếu không có dữ liệu
            otherUserId, // Thêm ID của người dùng khác vào dữ liệu cuộc trò chuyện
          };
        });
        setConversations(convos);
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <>
      {console.log(currentUser)}
      <div className="mt-10">
        <h1 className="text-success">TIN NHẮN</h1>
        {conversations.map((convo) => (
          <div key={convo.id} style={{ marginBottom: "10px" }}>
            <Link
              to={`/${isNhanVien === "true" ? "chatNV" : "chat"}/${convo.id}`} // Truyền ID của người dùng khác vào URL
              style={{ textDecoration: "none", color: "black" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={currentUser.avatar}
                  alt={`${convo.name}'s avatar`}
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
                <div style={{ marginLeft: "10px" }}>
                  <h4 style={{ margin: "0", fontSize: "16px" }}>
                    {convo.name}
                  </h4>
                  <p style={{ margin: "0", fontSize: "14px", color: "#555" }}>
                    {convo.latestMessage}
                  </p>
                  <small style={{ color: "#888" }}>{convo.latestTime}</small>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default Conversation;
