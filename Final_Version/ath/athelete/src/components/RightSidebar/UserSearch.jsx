import React, { useState, useEffect, useContext } from "react";
import { Input, Button, Avatar, Alert } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import avatar from "../../assets/images/avatar.png";

const UserSearch = ({ addFriend, checkIfAlreadyFriends }) => {
  const { user, userData } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const USERS_PER_PAGE = 10;
  
  // Function to search users
  const searchUsers = async (loadMore = false) => {
    if (!searchTerm.trim() && !loadMore) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let usersQuery;
      
      if (loadMore && lastDoc) {
        usersQuery = query(
          collection(db, "users"),
          orderBy("name"),
          startAfter(lastDoc),
          limit(USERS_PER_PAGE)
        );
      } else {
        usersQuery = query(
          collection(db, "users"),
          orderBy("name"),
          limit(USERS_PER_PAGE)
        );
      }
      
      const snapshot = await getDocs(usersQuery);
      
      if (!snapshot.empty) {
        const filteredUsers = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => {
            // Don't show the current user
            if (user.uid === userData?.uid) return false;
            
            // Don't show users who are already friends (if checkIfAlreadyFriends was passed)
            if (checkIfAlreadyFriends && checkIfAlreadyFriends(user.uid)) return false;
            
            if (searchTerm) {
              return (
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
            return true;
          });
        
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === USERS_PER_PAGE);
        } else {
          setHasMore(false);
        }
        
        if (loadMore) {
          setSearchResults(prev => [...prev, ...filteredUsers]);
        } else {
          setSearchResults(filteredUsers);
        }
      } else {
        if (!loadMore) {
          setSearchResults([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  const handleSubmitSearch = (e) => {
    e.preventDefault();
    searchUsers();
  };
  
  const handleLoadMore = () => {
    searchUsers(true);
  };

  const handleAddFriend = (user) => {
    // Make sure we have all required data before calling addFriend
    if (!user.uid) {
      console.error('Missing user ID');
      setError('User data incomplete');
      return;
    }
  
    const friendData = {
      name: user.name || user.displayName || 'Unknown User',
      image: user.profilePhoto || user.photoURL || null
    };
  
    addFriend(user.uid, friendData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <h2 className="text-xl font-bold mb-4">Find People</h2>
      
      <form onSubmit={handleSubmitSearch}>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10"
            labelProps={{
              className: "hidden",
            }}
          />
        </div>
        <Button 
            type="submit" 
            disabled={loading || !searchTerm.trim()}
            className="bg-blue-600 mt-2"
          >
            Search
          </Button>
      </form>
      
      {error && (
        <Alert color="red" className="mt-4">
          {error}
        </Alert>
      )}
      
      <div className="mt-4">
        {loading && !searchResults.length ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition duration-300"
              >
                <Link to={`/profile/${user.uid}`} className="flex items-center flex-1">
                  <Avatar
                    src={user.profilePhoto || avatar}
                    alt={user.name}
                    size="sm"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </Link>
                <Button 
                  onClick={() => handleAddFriend(user)}
                  size="sm"
                  className="bg-purple-600 ml-2"
                >
                  Add Friend
                </Button>
              </div>
            ))}
            
            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  variant="outlined"
                  className="border-purple-600 text-purple-600"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : searchTerm.trim() && !loading ? (
          <p className="text-center py-4 text-gray-500">No users found matching "{searchTerm}"</p>
        ) : null}
      </div>
    </div>
  );
};

export default UserSearch;