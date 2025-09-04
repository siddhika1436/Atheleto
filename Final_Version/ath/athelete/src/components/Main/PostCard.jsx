import React, { useState, useContext, useEffect, useReducer } from "react";
import avatar from "../../assets/images/avatar.png";
import like from "../../assets/images/like.png";
import comment from "../../assets/images/comment.png";
import remove from "../../assets/images/delete.png";
import addFriend from "../../assets/images/add-friend.png";
import { AuthContext } from "../AppContext/AppContext";
import {
  PostsReducer,
  postActions,
  postsStates,
} from "../AppContext/PostReducer";
import {
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import CommentSection from "./CommentSection";

const PostCard = ({ uid, id, name, email, text, image, timestamp }) => {
  const { user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const likesRef = doc(collection(db, "posts", id, "likes"));
  const likesCollection = collection(db, "posts", id, "likes");
  const singlePostDocument = doc(db, "posts", id);
  const { ADD_LIKE, HANDLE_ERROR } = postActions;
  const [open, setOpen] = useState(false);

  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const addUser = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const docSnap = await getDocs(q);
      const data = docSnap.docs[0].ref;
      await updateDoc(data, {
        friends: arrayUnion({
          id: uid,
          image: user?.photoURL || avatar,
          name: name,
        }),
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    const q = query(likesCollection, where("id", "==", user?.uid));
    const querySnapshot = await getDocs(q);
    const likesDocId = querySnapshot.docs[0]?.id;
    try {
      if (likesDocId !== undefined) {
        await deleteDoc(doc(db, "posts", id, "likes", likesDocId));
      } else {
        await setDoc(likesRef, { id: user?.uid });
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const deletePost = async (e) => {
    e.preventDefault();
    try {
      if (user?.uid === uid) {
        await deleteDoc(singlePostDocument);
      } else {
        alert("You can't delete other users' posts!");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    const getLikes = async () => {
      try {
        const q = collection(db, "posts", id, "likes");
        await onSnapshot(q, (doc) => {
          dispatch({
            type: ADD_LIKE,
            likes: doc.docs.map((item) => item.data()),
          });
        });
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        console.log(err.message);
      }
    };
    return () => getLikes();
  }, [id, ADD_LIKE, HANDLE_ERROR]);

  return (
    <div className="mb-4">
      <div className="flex flex-col py-4 bg-white rounded-t-3xl">
        <div className="flex justify-start items-center pb-4 pl-4">
          {user?.photoURL ? (
            <img
              className="h-12 w-12 rounded-full border border-gray-300 object-cover"
              src={user.photoURL}
              alt="User Avatar"
            />
          ) : (
            <div className="h-12 w-12 flex items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-gray-700 font-bold text-lg">
              {name?.charAt(0).toUpperCase() || "A"}
            </div>
          )}
          <div className="flex flex-col ml-4">
            <p className="py-2 font-roboto font-medium text-sm text-gray-700">
              {email}
            </p>
            <p className="font-roboto font-medium text-sm text-gray-700">
              Published: {timestamp}
            </p>
          </div>

          {user?.uid !== uid && (
            <div
              onClick={addUser}
              className="w-full flex justify-end cursor-pointer mr-10"
            >
              <img
                className="hover:bg-blue-100 rounded-xl p-2"
                src={addFriend}
                alt="Add Friend"
              />
            </div>
          )}
        </div>

        <div>
          <p className="ml-4 pb-4 font-roboto font-medium text-sm text-gray-700">
            {text}
          </p>
          {image && <img className="h-[500px] w-full object-cover" src={image} alt="Post Image" />}
        </div>

        <div className="flex justify-around items-center pt-4">
          <button
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            onClick={handleLike}
          >
            <img className="h-8 mr-4" src={like} alt="Like" />
            {state.likes?.length > 0 && state?.likes?.length}
          </button>

          <div
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            onClick={handleOpen}
          >
            <img className="h-8 mr-4" src={comment} alt="Comment" />
            <p className="font-roboto font-medium text-md text-gray-700">
              Comments
            </p>
          </div>

          <div
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            onClick={deletePost}
          >
            <img className="h-8 mr-4" src={remove} alt="Delete" />
            <p className="font-roboto font-medium text-md text-gray-700">
              Delete
            </p>
          </div>
        </div>
      </div>

      {open && <CommentSection postId={id} />}
    </div>
  );
};

export default PostCard;