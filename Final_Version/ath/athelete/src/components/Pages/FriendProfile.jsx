import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import RightSide from "../RightSidebar/RightSide";
import { Avatar, Spinner } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.png";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useParams } from "react-router-dom";
import PostCard from "../Main/PostCard";

const FriendProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [levels, setLevels] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [sponsorshipAgreement, setSponsorshipAgreement] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userDocRef = doc(db, "users", id);

        const unsubscribe = onSnapshot(
          userDocRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              setProfile({
                uid: userData.uid || id,
                ...userData,
              });
              setAchievements(userData.achievements || []);
              setLevels(userData.levels || []);
              setSponsorships(userData.sponsorships || []);
              setSponsorshipAgreement(userData.sponsorshipAgreement || null);
              setLoading(false);
            } else {
              const userQuery = query(collection(db, "users"), where("uid", "==", id));
              getDocs(userQuery).then((querySnapshot) => {
                if (!querySnapshot.empty) {
                  const userData = querySnapshot.docs[0].data();
                  setProfile({
                    uid: id,
                    ...userData,
                  });
                  setAchievements(userData.achievements || []);
                  setLevels(userData.levels || []);
                  setSponsorships(userData.sponsorships || []);
                  setSponsorshipAgreement(userData.sponsorshipAgreement || null);
                } else {
                  setError("User not found");
                }
                setLoading(false);
              });
            }
          },
          (error) => {
            console.error("Error in profile listener:", error);
            setError("Failed to load profile");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up profile listener:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!id) return;

      setPostsLoading(true);
      try {
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", id),
          orderBy("timestamp", "desc"),
          limit(10)
        );

        const unsubscribe = onSnapshot(
          postsQuery,
          (snapshot) => {
            const postsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setPosts(postsData);
            setPostsLoading(false);
          },
          (error) => {
            console.error("Error fetching user posts:", error);
            setPostsLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up posts listener:", err);
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-[75%]">
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>

      <div className="flex bg-gray-100 pt-16">
        <div className="flex-auto w-[70%] bg-gray-100 rounded-xl">
          <div className="w-[95%] mx-auto">
            <div className="relative mb-8">
              <div className="h-80 w-full rounded-xl overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={profile?.coverPhoto || "https://via.placeholder.com/1200x400"}
                  alt="cover"
                />
              </div>

              <div className="absolute -bottom-6 left-6 flex items-end space-x-4">
                <Avatar
                  size="xxl"
                  variant="circular"
                  src={profile?.profilePhoto || profile?.photoURL || avatar}
                  alt="avatar"
                  className="border-4 border-white"
                />
                <div className="mb-2 bg-white p-4 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold">
                    {profile?.name || profile?.displayName}
                  </h2>
                  <p className="text-gray-600">{profile?.email}</p>
                  {profile?.tagline && (
                    <p className="text-gray-500 italic mt-1">"{profile.tagline}"</p>
                  )}
                </div>
              </div>
            </div>

            {profile?.sportsName && (
              <div className="bg-black text-white p-4 rounded-xl mb-6 text-center">
                <h3 className="text-xl font-bold">{profile.sportsName}</h3>
              </div>
            )}

            {levels && levels.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-bold mb-4">Levels</h3>
                <div className="flex flex-wrap gap-4">
                  {levels.map((level, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[200px]">
                      <p className="text-gray-800">{level.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements && achievements.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-bold mb-4">Achievements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {achievement.image ? (
                        <img
                          src={achievement.image}
                          alt={`Achievement ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                      <p className="text-sm text-center">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sponsorships && sponsorships.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-bold mb-4">Sponsorships</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {sponsorships.map((sponsorship, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {sponsorship.image ? (
                        <img
                          src={sponsorship.image}
                          alt={`Sponsorship ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                      <p className="text-sm text-center">{sponsorship.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.userType === "Sponsor" && sponsorshipAgreement && (
              <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-bold mb-4">Sponsorship Agreement</h3>
                <div className="text-center">
                  <img
                    src={sponsorshipAgreement}
                    alt="Sponsorship Agreement"
                    className="max-w-full max-h-96 rounded-lg mx-auto"
                  />
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h3 className="text-xl font-bold mb-4">Recent Posts</h3>

              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8" color="purple" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      logo={post.logo || profile?.profilePhoto || profile?.photoURL}
                      id={post.id}
                      uid={post.uid}
                      name={post.name || profile?.name || profile?.displayName}
                      email={post.email || profile?.email}
                      image={post.image}
                      text={post.text}
                      timestamp={post.timestamp?.toDate()?.toLocaleString()}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No posts to display</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-auto w-[30%] fixed right-0">
          <RightSide />
        </div>
      </div>
    </div>
  );
};

export default FriendProfile;