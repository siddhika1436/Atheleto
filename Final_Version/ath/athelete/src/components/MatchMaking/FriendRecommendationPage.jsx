import React, { useState, useContext, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { AuthContext } from '../AppContext/AppContext';
import FriendRecommendations from './FriendRecommendations';
import Navbar from '../Navbar/Navbar';
import { Alert } from "@material-tailwind/react";

const FriendRecommendationsPage = () => {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [friends, setFriends] = useState([]);

  // Fetch current user's friends list
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setFriends(userDoc.data().friends || []);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
        setError("Failed to load friends list");
      }
    };

    fetchFriends();
  }, [user?.uid]);

  // Function to check if users are already friends
  const checkIfAlreadyFriends = (friendId) => {
    return friends.some(friend => friend.id === friendId || friend.uid === friendId);
  };

  // Function to add a new friend
  const addFriend = async (friendId, friendData) => {
    try {
      setError(null);
      setSuccess(null);

      if (!user?.uid) {
        throw new Error("You must be logged in to add friends");
      }

      if (!friendId || !friendData) {
        throw new Error("Invalid friend data");
      }

      if (checkIfAlreadyFriends(friendId)) {
        throw new Error("You are already friends with this user");
      }

      // Prepare friend object
      const friendObject = {
        id: friendId,
        uid: friendId,
        name: friendData.name || friendData.displayName || "User",
        displayName: friendData.displayName || friendData.name || "User",
        image: friendData.profilePhoto || friendData.image || null
      };

      // Get current user's document
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const userDocs = await getDocs(userQuery);

      if (userDocs.empty) {
        throw new Error("User profile not found");
      }

      // Update current user's friends list
      const userDocId = userDocs.docs[0].id;
      await updateDoc(doc(db, "users", userDocId), {
        friends: arrayUnion(friendObject)
      });

      // Prepare current user object for friend's list
      const currentUserObject = {
        id: user.uid,
        name: user.displayName || "Unknown User",
        image: user.photoURL || null
      };

      // Update friend's friends list
      const friendQuery = query(
        collection(db, "users"),
        where("uid", "==", friendId)
      );
      const friendDocs = await getDocs(friendQuery);

      if (!friendDocs.empty) {
        const friendDocId = friendDocs.docs[0].id;
        await updateDoc(doc(db, "users", friendDocId), {
          friends: arrayUnion(currentUserObject)
        });

        setSuccess("Friend added successfully!");
        // Update local friends list
        setFriends(prev => [...prev, friendObject]);
      } else {
        throw new Error("Friend's profile not found");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      setError(error.message || "Failed to add friend. Please try again.");
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Friend Recommendations
          </h1>

          {(error || success) && (
            <Alert
              color={error ? "red" : "green"}
              className="mb-4"
              onClose={() => {
                setError(null);
                setSuccess(null);
              }}
            >
              {error || success}
            </Alert>
          )}

          <div className="bg-white rounded-lg shadow-md">
            <FriendRecommendations 
              addFriend={addFriend}
              checkIfAlreadyFriends={checkIfAlreadyFriends}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRecommendationsPage;