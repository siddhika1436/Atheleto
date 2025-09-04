import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { Link } from "react-router-dom";
import avatar from "../../assets/images/avatar.png";
import remove from "../../assets/images/delete.png";
import UserSearch from "./UserSearch";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const RightSide = () => {
  const [input, setInput] = useState("");
  const { user, userData } = useContext(AuthContext);
  const [friendList, setFriendList] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends");
  const [sportsNews, setSportsNews] = useState([]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = query(collection(db, "users"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setFriendList(userData.friends || []);
          setLoading(false);
        } else {
          setFriendList([]);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching friends:", error);
        setError("Failed to load friends list");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    const fetchSportsNews = async () => {
      try {
        const response = await fetch("https://newsapi.org/v2/top-headlines?category=sports&language=en&apiKey=fc3f5570b114453391f2e5eb566f8d10");
        const data = await response.json();
        setSportsNews(data.articles || []);
      } catch (error) {
        console.error("Error fetching sports news:", error);
      }
    };
    fetchSportsNews();
  }, []);

  // Function to remove friend
  const removeFriend = async (friendId) => {
    try {
      const friendToRemove = friendList.find(friend => friend.id === friendId);
      if (!friendToRemove) {
        setError("Friend not found");
        return;
      }

      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const userDocs = await getDocs(userQuery);

      if (!userDocs.empty) {
        const userDocId = userDocs.docs[0].id;
        await updateDoc(doc(db, "users", userDocId), {
          friends: arrayRemove(friendToRemove)
        });
      }

      const friendQuery = query(
        collection(db, "users"),
        where("uid", "==", friendId)
      );
      const friendDocs = await getDocs(friendQuery);
      if (!friendDocs.empty) {
        const friendDocId = friendDocs.docs[0].id;
        const currentUserObject = {
          id: user.uid,
          name: user.displayName || userData?.name || "User",
          image: user.photoURL || userData?.profilePhoto || null
        };

        await updateDoc(doc(db, "users", friendDocId), {
          friends: arrayRemove(currentUserObject)
        });
      }

      setSuccess("Friend removed!");
    } catch (error) {
      console.error("Error removing friend:", error);
      setError("Failed to remove friend");
    }
  };



  const searchFriends = (data) => {
    return data.filter((item) => item.name.toLowerCase().includes(input.toLowerCase()));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 shadow-lg rounded-xl w-[300px] mx-auto p-4 mt-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">{success}</div>}

      <div className="mb-4">
        <div className="flex space-x-4 border-b">
          <button
            className={`py-2 px-4 ${activeTab === "friends" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            Friends
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "search" ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            Search
          </button>
        </div>
      </div>

      {activeTab === "friends" && (
        <div>
          <input
            type="text"
            placeholder="Search friends"
            className="w-full p-2 border rounded mb-4"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : friendList.length > 0 ? (
            <div className="space-y-2">
              {searchFriends(friendList).map((friend) => (
                <div key={friend.id} className="flex items-center justify-between bg-white p-2 rounded">
                  <Link to={`/profile/${friend.id}`} className="flex items-center">
                    <img src={friend.image || avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                    <span className="ml-2">{friend.name}</span>
                  </Link>
                  <button onClick={() => removeFriend(friend.id)} className="p-1 hover:bg-red-100 rounded">
                    <img src={remove} alt="remove" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No friends yet</div>
          )}
        </div>
      )}

      {activeTab === "search" && <UserSearch addFriend={addFriend} checkIfAlreadyFriends={checkIfAlreadyFriends} />}

      <div className="mt-4 overflow-y-scroll">
        <h2 className="text-lg font-bold mb-2">Sports News</h2>
        <div className="space-y-2">
          {sportsNews.map((news, index) => (
            <div key={index} className="bg-white p-2 rounded shadow">
              <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{news.title}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSide;
