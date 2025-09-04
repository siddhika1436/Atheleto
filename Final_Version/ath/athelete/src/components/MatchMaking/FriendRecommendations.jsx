import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AuthContext } from "../AppContext/AppContext";
import { Avatar } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.png";

const FriendRecommendations = ({ addFriend, checkIfAlreadyFriends }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, userData } = useContext(AuthContext);


  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.uid) {
        console.log("No user ID available, stopping recommendations fetch");
        setLoading(false);
        return;
      }

      if (typeof checkIfAlreadyFriends !== 'function') {
        console.error("checkIfAlreadyFriends is not a function");
        setError("Configuration error. Please refresh the page.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        
        const recommendedUsers = [];
        
        querySnapshot.forEach((doc) => {
          const potentialFriend = doc.data();
          
          // Skip current user and existing friends
          if (potentialFriend.uid === user.uid || checkIfAlreadyFriends(potentialFriend.uid)) {
            return;
          }

          // Calculate match score
          let matchScore = 1;
          
          if (userData?.sportsName && potentialFriend.sportsName === userData.sportsName) {
            matchScore += 5;
          }
          
          if (userData?.userType && potentialFriend.userType) {
            if (
              (userData.userType === "Athlete" && potentialFriend.userType === "Sponsor") ||
              (userData.userType === "Sponsor" && potentialFriend.userType === "Athlete")
            ) {
              matchScore += 3;
            }
          }

          // Ensure we have complete user data before adding to recommendations
          if (potentialFriend.uid) {
            recommendedUsers.push({
              id: potentialFriend.uid,
              uid: potentialFriend.uid,
              name: potentialFriend.displayName || potentialFriend.name || "User",
              displayName: potentialFriend.displayName || potentialFriend.name || "User",
              image: potentialFriend.profilePhoto || null,
              profilePhoto: potentialFriend.profilePhoto || null,
              email: potentialFriend.email || "",
              sportsName: potentialFriend.sportsName || "",
              userType: potentialFriend.userType || "",
              matchScore
            });
          }
        });
        
        recommendedUsers.sort((a, b) => b.matchScore - a.matchScore);
        setRecommendations(recommendedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to load recommendations");
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, userData, checkIfAlreadyFriends]);

  const handleAddFriend = async (rec) => {
    if (!user?.uid) {
      setError("You must be logged in to add friends");
      return;
    }
    
    try {
      setError(null);
      
      // Create a complete friend data object with ALL necessary fields
      const friendData = {
        uid: rec.uid,
        id: rec.uid,
        name: rec.displayName || rec.name || "User",
        displayName: rec.displayName || rec.name || "User",
        email: rec.email || "",
        profilePhoto: rec.profilePhoto || rec.image || null,
        image: rec.profilePhoto || rec.image || null,
        userType: rec.userType || "",
        sportsName: rec.sportsName || ""
      };

      await addFriend(rec.uid, friendData);
      
      // Remove the added friend from recommendations
      setRecommendations(prev => prev.filter(friend => friend.uid !== rec.uid));
    } catch (error) {
      console.error("Error adding friend:", error);
      setError("Failed to add friend. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  // Only show empty state if we have user data but no recommendations
  const showEmptyState = !loading && recommendations.length === 0 && user?.uid;

  return (
    <div className="relative mb-4 h-screen overflow-y-auto bg-white rounded-lg shadow">
      <div className="sticky top-0 bg-white z-10 p-3 border-b">
        <h3 className="font-bold text-xl text-gray-800">
          Suggested Connections
        </h3>
        {error && (
          <div className="text-center py-1 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
      
      {showEmptyState && (
        <div className="text-center py-8 text-gray-500">
          Looking for more connections... Check back later!
        </div>
      )}
      
      <div className="space-y-2 p-3">
        {recommendations.map((rec) => (
          <div 
            key={rec.uid}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center">
              <Avatar 
                size="sm"
                variant="circular"
                src={rec.profilePhoto || rec.image || avatar}
                alt={rec.displayName || rec.name}
                className="border border-gray-200"
              />
              <div className="ml-3">
                <p className="font-medium  text-gray-800">{rec.displayName || rec.name}</p>
                <div className="flex flex-col text-xs">
                  <div className="flex gap-1">
                    {rec.userType && (
                      <span className="text-blue-600">
                        {rec.userType}
                      </span>
                    )}
                    {rec.sportsName && (
                      <span className="text-gray-500">
                        • {rec.sportsName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleAddFriend(rec)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
            >
              Add Friend
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRecommendations;

