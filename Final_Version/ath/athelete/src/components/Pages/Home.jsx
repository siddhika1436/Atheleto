import React from "react";
import Navbar from "../Navbar/Navbar";
import LeftSide from "../LeftSidebar/LeftSide";
import RightSide from "../RightSidebar/RightSide";
import CardSection from "../Main/CardSection";
import Main from "../Main/Main";



const Home = () => {
  return (
    <div className="w-full overflow-y-scroll">
      <div className="fixed top-0 z-10 w-full bg-white h-12">
        <Navbar />
      </div>
      
      <div className="flex bg-gray-100">
        <div className="flex-auto w-[20%] fixed top-12 overflow-y-auto">
          <LeftSide></LeftSide>
        </div>
        
        <div className="flex-auto items-center w-[50%] absolute left-[25%] top-14 bg-gray-100 rounded-xl">
          <div className="w-[95%] mx-auto">
    
            <Main></Main>
          </div>
        </div>
        
        <div className="flex-auto w-[25%] fixed right-0 top-12">
          <RightSide></RightSide>
        </div>
      </div>
    </div>
  );
};

export default Home;