import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { Avatar } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.png";
import Navbar from "../Navbar/Navbar";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const Messaging = () => {
  const { user, userData } = useContext(AuthContext);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Get list of conversations for current user
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = [];
      snapshot.forEach((doc) => {
        convos.push({ id: doc.id, ...doc.data() });
      });
      setConversations(convos);
    });

    return () => unsubscribe();
  }, [user]);

  // Get messages for selected conversation
  useEffect(() => {
    if (!selectedFriend) return;

    const conversationId = getConversationId(user.uid, selectedFriend.id);
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedFriend, user]);

  const getConversationId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedFriend) return;

    const conversationId = getConversationId(user.uid, selectedFriend.id);

    try {
      // Add message to conversation
      await addDoc(collection(db, `conversations/${conversationId}/messages`), {
        text: message,
        senderId: user.uid,
        senderName: userData.name,
        senderImage: userData.image || avatar,
        timestamp: serverTimestamp(),
      });

      // Update conversation metadata
      await addDoc(collection(db, "conversations"), {
        id: conversationId,
        participants: [user.uid, selectedFriend.id],
        participantNames: [userData.name, selectedFriend.name],
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
      }, { merge: true });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 mt-15">
      <div className="fixed top-0 z-10 w-full bg-white h-12">
        <Navbar />
      </div>
      {/* Friends List */}
      <div className="w-1/4 bg-white border-r h-screen ">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          {userData?.friends?.map((friend) => (
            <div
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                selectedFriend?.id === friend.id ? "bg-gray-100" : ""
              }`}
            >
              <Avatar
                size="md"
                variant="circular"
                src={friend.image || avatar}
                alt={friend.name}
              />
              <div className="ml-4">
                <p className="font-medium">{friend.name}</p>
                <p className="text-sm text-gray-500">
                  {conversations.find(c => 
                    c.participants.includes(friend.id))?.lastMessage || "Start a conversation"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center">
                <Avatar
                  size="md"
                  variant="circular"
                  src={selectedFriend.image || avatar}
                  alt={selectedFriend.name}
                />
                <span className="ml-4 font-medium">{selectedFriend.name}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user.uid ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      msg.senderId === user.uid
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp?.toDate().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a friend to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;