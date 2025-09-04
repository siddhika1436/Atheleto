import React, { useRef, useState, useEffect, useContext } from "react";
import { Avatar } from "@material-tailwind/react";
import { AuthContext } from "../AppContext/AppContext";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";

const LeftSide = () => {
  const { user, userData } = useContext(AuthContext);
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || "");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [tagline, setTagline] = useState("");
  const [isEditingTagline, setIsEditingTagline] = useState(false);
  const [newTagline, setNewTagline] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [levels, setLevels] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [sportsName, setSportsName] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [newAchievement, setNewAchievement] = useState({ image: "", description: "" });
  const [newSponsorship, setNewSponsorship] = useState({ image: "", description: "" });
  const [userType, setUserType] = useState("");
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  
  // Sponsor specific fields
  const [sponsorshipAgreement, setSponsorshipAgreement] = useState("");
  const [sponsorshipType, setSponsorshipType] = useState("");

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const achievementInputRef = useRef(null);
  const sponsorshipInputRef = useRef(null);
  const agreementInputRef = useRef(null);

  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfilePhoto(data.profilePhoto || user?.photoURL || "");
        setCoverPhoto(data.coverPhoto || "");
        setTagline(data.tagline || "");
        setAchievements(data.achievements || []);
        setLevels(data.levels || []);
        setSponsorships(data.sponsorships || []);
        setSportsName(data.sportsName || "");
        setUserType(data.userType || "");
        setSponsorshipAgreement(data.sponsorshipAgreement || "");
        setSponsorshipType(data.sponsorshipType || "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const updateUserData = async (key, value) => {
    try {
      await setDoc(doc(db, "users", user.uid), { [key]: value }, { merge: true });
    } catch (error) {
      console.error('Error updating ${key}, error');
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const imageData = reader.result;
        if (type === "profile") {
          setProfilePhoto(imageData);
          await updateUserData("profilePhoto", imageData);
        } else if (type === "cover") {
          setCoverPhoto(imageData);
          await updateUserData("coverPhoto", imageData);
        } else if (type === "agreement") {
          setSponsorshipAgreement(imageData);
          await updateUserData("sponsorshipAgreement", imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTaglineUpdate = async () => {
    if (newTagline.trim() !== "") {
      setTagline(newTagline);
      await updateUserData("tagline", newTagline);
      setIsEditingTagline(false);
      setNewTagline("");
    }
  };

  const handleAddLevel = async () => {
    if (newLevel.trim()) {
      const updatedLevels = [...levels, { id: Date.now(), description: newLevel }];
      setLevels(updatedLevels);
      await updateUserData("levels", updatedLevels);
      setNewLevel("");
    }
  };

  const handleAddAchievement = async () => {
    if (newAchievement.description.trim()) {
      const updatedAchievements = [...achievements, { id: Date.now(), image: newAchievement.image, description: newAchievement.description }];
      setAchievements(updatedAchievements);
      await updateUserData("achievements", updatedAchievements);
      setNewAchievement({ image: "", description: "" });
    }
  };

  const handleAddSponsorship = async () => {
    if (newSponsorship.description.trim()) {
      const updatedSponsorships = [...sponsorships, { id: Date.now(), image: newSponsorship.image, description: newSponsorship.description }];
      setSponsorships(updatedSponsorships);
      await updateUserData("sponsorships", updatedSponsorships);
      setNewSponsorship({ image: "", description: "" });
    }
  };

  const handleDelete = async (id, key, setter, data) => {
    const updatedData = data.filter((item) => item.id !== id);
    setter(updatedData);
    await updateUserData(key, updatedData);
  };

  const handleAddSportsName = async () => {
    if (sportsName.trim()) {
      await updateUserData("sportsName", sportsName);
    }
  };

  const handleSetUserType = async (type) => {
    setUserType(type);
    await updateUserData("userType", type);
    setShowUserTypeSelection(false);
    setShowOptions(true);
  };

  const handleSponsorshipType = async (type) => {
    setSponsorshipType(type);
    await updateUserData("sponsorshipType", type);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F6F0F0] pb-4 border-2 rounded-r-xl shadow-lg mt-4 ml-4 overflow-y-auto">
      <div className="flex flex-col items-center relative">
        {/* Cover Photo Section */}
        <div className="relative w-full">
          <input
            type="file"
            ref={coverInputRef}
            hidden
            onChange={(e) => handleFileUpload(e, "cover")}
            accept="image/*"
          />
          <img
            className="h-28 w-full rounded-r-xl cursor-pointer object-cover"
            src={coverPhoto || "https://via.placeholder.com/500x150"}
            alt="cover"
          />
          <button
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            onClick={() => coverInputRef.current.click()}
          >
            <PencilIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Profile Photo Section */}
        <div className="absolute -bottom-4">
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={(e) => handleFileUpload(e, "profile")}
            accept="image/*"
          />
          <div className="relative">
            <Avatar
              size="md"
              src={profilePhoto || "https://via.placeholder.com/100"}
              alt="avatar"
              className="cursor-pointer"
            />
            <button
              className="absolute -right-2 -bottom-2 bg-blue-500 text-white rounded-full p-1 shadow-md hover:bg-blue-600"
              onClick={() => fileInputRef.current.click()}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="flex flex-col items-center pt-6">
        <p className="font-roboto font-medium text-md text-black tracking-normal leading-none">
          {user?.displayName || userData?.name || "User"}
        </p>
        
        {userType && (
          <div className="mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {userType}
          </div>
        )}
        
        {/* Tagline Section */}
        <div className="mt-2">
          {isEditingTagline ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagline}
                onChange={(e) => setNewTagline(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                placeholder="Enter your tagline"
              />
              <button
                onClick={handleTaglineUpdate}
                className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-roboto text-xs text-gray-500">
                {tagline || "Add a tagline"}
              </p>
              <button
                onClick={() => setIsEditingTagline(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <PencilIcon className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Build Profile Button */}
      {!userType ? (
        <button 
          className="mt-4 mx-4 p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          onClick={() => setShowUserTypeSelection(true)}
        >
          Build Profile
        </button>
      ) : (
        <button 
          className="mt-4 mx-4 p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          onClick={() => setShowOptions(!showOptions)}
        >
          Edit Profile
        </button>
      )}

      {/* User Type Selection */}
      {showUserTypeSelection && (
        <div className="mt-4 mx-4 p-4 border rounded-lg bg-white">
          <h3 className="font-bold mb-4 text-center">What best describes you?</h3>
          <div className="flex flex-col gap-3">
            <button 
              className="p-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
              onClick={() => handleSetUserType("Athlete")}
            >
              I am an Athlete
            </button>
            <button 
              className="p-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all"
              onClick={() => handleSetUserType("Sponsor")}
            >
              I am a Sponsor
            </button>
          </div>
        </div>
      )}

      {/* Display Sports Name */}
      {sportsName && (
        <div className="mt-2 mx-4 p-2 bg-black text-white text-center rounded-lg text-sm">
          {sportsName}
        </div>
      )}
      
      {/* Display Sponsorship Type for Sponsors */}
      {userType === "Sponsor" && sponsorshipType && (
        <div className="mt-2 mx-4 p-2 bg-green-700 text-white text-center rounded-lg text-sm">
          {sponsorshipType} Sponsorship
        </div>
      )}

      {/* Build Profile Options */}
      {showOptions && (
        <div className="mt-4 mx-4 p-4 border rounded-lg bg-white">
          <h3 className="font-bold mb-2">Add to Profile:</h3>
          
          {/* Sports Name Section - Common for both */}
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border rounded-lg mb-2"
              placeholder="Enter sports name"
              value={sportsName}
              onChange={(e) => setSportsName(e.target.value)}
            />
            <button 
              className="w-full p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              onClick={handleAddSportsName}
            >
              Add Sports Name
            </button>
          </div>

          {/* Sponsor-specific sections */}
          {userType === "Sponsor" && (
            <>
              {/* Sponsorship Agreement Upload */}
              <div className="mb-4">
                <input
                  type="file"
                  ref={agreementInputRef}
                  hidden
                  onChange={(e) => handleFileUpload(e, "agreement")}
                  accept="image/*,.pdf"
                />
                <button 
                  className="w-full p-2 mb-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                  onClick={() => agreementInputRef.current.click()}
                >
                  Upload Sponsorship Agreement
                </button>
                {sponsorshipAgreement && (
                  <div className="text-xs text-green-600 text-center mb-2">
                    Agreement uploaded successfully
                  </div>
                )}
              </div>

              {/* Sponsorship Type */}
              <div className="mb-4">
                <h4 className="font-bold text-sm mb-2">Sponsorship Type:</h4>
                <div className="flex flex-col gap-2">
                  {["Paid", "Equipment-based", "Training-based"].map((type) => (
                    <button
                      key={type}
                      className={`p-2 border rounded-lg text-sm ${
                        sponsorshipType === type ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSponsorshipType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Major Sponsorships */}
              <div className="mb-4">
                <h4 className="font-bold text-sm mb-2">Major Sponsorships:</h4>
                <input
                  type="file"
                  ref={sponsorshipInputRef}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setNewSponsorship({ ...newSponsorship, image: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button 
                  className="w-full p-2 mb-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                  onClick={() => sponsorshipInputRef.current.click()}
                >
                  Upload Sponsorship Image
                </button>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg mb-2"
                  placeholder="Enter sponsorship description"
                  value={newSponsorship.description}
                  onChange={(e) => setNewSponsorship({ ...newSponsorship, description: e.target.value })}
                />
                <button 
                  className="w-full p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                  onClick={handleAddSponsorship}
                >
                  Add Sponsorship
                </button>
              </div>
            </>
          )}

          {/* Athlete-specific sections */}
          {userType === "Athlete" && (
            <>
              {/* Level Section */}
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg mb-2"
                  placeholder="Enter level description"
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                />
                <button 
                  className="w-full p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                  onClick={handleAddLevel}
                >
                  Add Level
                </button>
              </div>

              {/* Achievement Section */}
              <div className="mb-4">
                <input
                  type="file"
                  ref={achievementInputRef}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setNewAchievement({ ...newAchievement, image: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button 
                  className="w-full p-2 mb-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                  onClick={() => achievementInputRef.current.click()}
                >
                  Upload Achievement Image
                </button>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg mb-2"
                  placeholder="Enter achievement description"
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                />
                <button 
                  className="w-full p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                  onClick={handleAddAchievement}
                >
                  Add Achievement
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Display Sections based on user type */}
      {userType === "Athlete" && [
        { title: "Levels", data: levels, key: "levels", setter: setLevels },
        { title: "Achievements", data: achievements, key: "achievements", setter: setAchievements },
      ].map((section) => (
        section.data.length > 0 && (
          <div key={section.key} className="mt-4 mx-4 border p-2 rounded-lg overflow-y-auto max-h-48 bg-white">
            <h3 className="font-bold">{section.title}:</h3>
            <div className="flex flex-wrap gap-2">
              {section.data.map((item) => (
                <div key={item.id} className="relative w-20 h-20 flex flex-col items-center">
                  {item.image && <img src={item.image} className="w-20 h-20 object-cover rounded" alt={section.title.toLowerCase()} />}
                  <p className="text-xs text-center">{item.description}</p>
                  <button
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    onClick={() => handleDelete(item.id, section.key, section.setter, section.data)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* Display Sponsorships Section for Sponsors */}
      {userType === "Sponsor" && sponsorships.length > 0 && (
        <div className="mt-4 mx-4 border p-2 rounded-lg overflow-y-auto max-h-48 bg-white">
          <h3 className="font-bold">Major Sponsorships:</h3>
          <div className="flex flex-wrap gap-2">
            {sponsorships.map((item) => (
              <div key={item.id} className="relative w-20 h-20 flex flex-col items-center">
                {item.image && <img src={item.image} className="w-20 h-20 object-cover rounded" alt="sponsorship" />}
                <p className="text-xs text-center">{item.description}</p>
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                  onClick={() => handleDelete(item.id, "sponsorships", setSponsorships, sponsorships)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Agreement for Sponsors */}
      {userType === "Sponsor" && sponsorshipAgreement && (
        <div className="mt-4 mx-4 border p-2 rounded-lg bg-white">
          <h3 className="font-bold mb-2">Sponsorship Agreement:</h3>
          <div className="flex justify-center">
            <img src={sponsorshipAgreement} className="max-h-32 object-contain" alt="agreement" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftSide;