import React, { useContext } from 'react';
import { Tooltip } from "@material-tailwind/react";
import { AuthContext } from '../AppContext/AppContext';

const UserLinks = () => {
  const { signOutUser, user, userData } = useContext(AuthContext);
  const username = user?.displayName || userData?.name || "U";
  const firstLetter = username.charAt(0).toUpperCase();

  return (
    

      <div className='mx-4 items-center flex' onClick={signOutUser}>
        <Tooltip content="Sign Out" placement="bottom">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-white font-bold">
            {firstLetter}
          </div>
        </Tooltip>
        <p className="ml-4 font-roboto text-sm text-white font-medium no-underline">
          {username.split(" ")[0]}
        </p>
      </div>
    
  );
}

export default UserLinks;
