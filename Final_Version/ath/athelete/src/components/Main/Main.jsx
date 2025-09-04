import React, { useState, useRef, useContext, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { Alert } from "@material-tailwind/react";
import { AuthContext } from "../AppContext/AppContext";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  limit,
  getDocs,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import PostCard from "./PostCard";
import live from "../../assets/images/live.png";
import smile from "../../assets/images/smile.jpg";
import addImage from "../../assets/images/addImage.png";

const Main = ({ userId }) => {
  const { user, userData } = useContext(AuthContext);
  const text = useRef("");
  const scrollRef = useRef("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const POSTS_PER_PAGE = 10;

  const collectionRef = collection(db, "posts");
  const postRef = doc(collection(db, "posts"));
  const document = postRef.id;

  // Check if we're viewing own profile or friend's profile
  const isOwnProfile = !userId || userId === user?.uid;

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImage(reader.result);
      };
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (text.current.value !== "") {
      try {
        setLoading(true);
        await setDoc(postRef, {
          documentId: document,
          uid: user?.uid || userData?.uid,
          logo: user?.photoURL,
          name: user?.displayName || userData?.name,
          email: user?.email || userData?.email,
          text: text.current.value,
          image: image,
          timestamp: serverTimestamp(),
          likes: [],
          comments: []
        });
        text.current.value = "";
        setImage(null);
        setFile(null);
        setError(null);
      } catch (err) {
        console.error("Error submitting post:", err);
        setError("Failed to create post. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Load initial posts
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      let postsQuery;

      if (userId) {
        // If viewing a specific profile, show only their posts
        postsQuery = query(
          collectionRef,
          where("uid", "==", userId),
          orderBy("timestamp", "desc"),
          limit(POSTS_PER_PAGE)
        );
      } else {
        // In main feed, get all posts initially
        postsQuery = query(
          collectionRef,
          orderBy("timestamp", "desc"),
          limit(POSTS_PER_PAGE)
        );
      }

      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Set last document for pagination
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          
          // If on main feed, sort to prioritize friends' posts
          if (!userId && userData?.friends) {
            const friendIds = userData.friends.map(friend => friend.id);
            
            // Separate friends' posts and other posts
            const friendsPosts = fetchedPosts.filter(post => 
              friendIds.includes(post.uid)
            );
            const otherPosts = fetchedPosts.filter(post => 
              !friendIds.includes(post.uid)
            );

            // Combine with friends' posts first
            setPosts([...friendsPosts, ...otherPosts]);
          } else {
            setPosts(fetchedPosts);
          }
          
          setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
        } else {
          setPosts([]);
          setHasMore(false);
        }
        
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please refresh the page.");
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up posts listener:", err);
      setError("Failed to load posts. Please refresh the page.");
      setLoading(false);
    }
  }, [userId, user?.uid, userData?.friends]);

  // Function to load more posts
  const loadMorePosts = async () => {
    if (!lastDoc || loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      let nextQuery;
      if (userId) {
        nextQuery = query(
          collectionRef,
          where("uid", "==", userId),
          orderBy("timestamp", "desc"),
          startAfter(lastDoc),
          limit(POSTS_PER_PAGE)
        );
      } else {
        nextQuery = query(
          collectionRef,
          orderBy("timestamp", "desc"),
          startAfter(lastDoc),
          limit(POSTS_PER_PAGE)
        );
      }
      
      const snapshot = await getDocs(nextQuery);
      
      if (!snapshot.empty) {
        const newPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Update last document
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        
        // If on main feed, sort to prioritize friends' posts for the new batch
        if (!userId && userData?.friends) {
          const friendIds = userData.friends.map(friend => friend.id);
          
          // Separate friends' posts and other posts
          const friendsPosts = newPosts.filter(post => 
            friendIds.includes(post.uid)
          );
          const otherPosts = newPosts.filter(post => 
            !friendIds.includes(post.uid)
          );

          // Add to existing posts
          setPosts(prevPosts => [...prevPosts, ...friendsPosts, ...otherPosts]);
        } else {
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        }
        
        // Check if there might be more posts
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
      setError("Failed to load more posts. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      {/* Only show post creation on main feed or own profile */}
      {isOwnProfile && (
        <div className="flex flex-col py-4 w-full bg-white rounded-3xl shadow-lg">
          <div className="flex items-center border-b-2 border-gray-300 pb-4 pl-4 w-full">
            <div className="w-10 h-10 flex items-center justify-center bg-purple-800 text-white rounded-full text-lg font-bold">
              {(user?.displayName || userData?.name)?.charAt(0).toUpperCase()}
            </div>
            <form className="w-full" onSubmit={handleSubmitPost}>
              <div className="flex justify-between items-center">
                <div className="w-full ml-4">
                  <input
                    type="text"
                    name="text"
                    placeholder={`What's on your mind ${
                      user?.displayName?.split(" ")[0] ||
                      userData?.name?.charAt(0).toUpperCase() +
                        userData?.name?.slice(1)
                    }?`}
                    className="outline-none w-full bg-white rounded-md"
                    ref={text}
                  />
                </div>
                {image && (
                  <div className="mx-4">
                    <img
                      className="h-24 rounded-xl"
                      src={image}
                      alt="previewImage"
                    />
                  </div>
                )}
                <div className="mr-4">
                  <Button 
                    variant="text" 
                    type="submit"
                    disabled={loading}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </form>
          </div>
          <div className="flex justify-around items-center pt-4">
            <div className="flex items-center">
              <label htmlFor="addImage" className="cursor-pointer flex items-center">
                <img className="h-10 mr-4" src={addImage} alt="addImage" />
                <input
                  id="addImage"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleUpload}
                />
              </label>
            </div>
            <div className="flex items-center">
              <img className="h-10 mr-4" src={live} alt="live" />
              <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
                Live
              </p>
            </div>
            <div className="flex items-center">
              <img className="h-10 mr-4" src={smile} alt="feeling" />
              <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
                Feeling
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col py-4 w-full">
        {error ? (
          <Alert color="red" className="mb-4">
            {error}
          </Alert>
        ) : loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  logo={post.logo}
                  id={post.id}
                  uid={post.uid}
                  name={post.name}
                  email={post.email}
                  image={post.image}
                  text={post.text}
                  timestamp={post.timestamp?.toDate()?.toLocaleString()}
                />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={loadMorePosts}
                  disabled={loadingMore}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loadingMore ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    "Load More Posts"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">No posts to display</p>
        )}
      </div>
    </div>
  );
};

export default Main;