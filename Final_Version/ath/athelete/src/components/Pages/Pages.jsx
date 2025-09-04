import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";
import FriendProfile from "./FriendProfile";
import Messaging from "../Messages&Noti/Messaging";
import NotificationsPage from "../Messages&Noti/Notifications";
import FriendRecommendation from "../MatchMaking/FriendRecommendationPage";

const Pages = () => {
  return (
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/profile/:id" element={<FriendProfile />} />
        <Route path='/messaging' element={<Messaging/>}></Route>
        <Route path='/notifications' element={<NotificationsPage/>}></Route>
        <Route path='/recommendations' element={<FriendRecommendation/>}></Route>
       
      </Routes>

  );
};

export default Pages;
