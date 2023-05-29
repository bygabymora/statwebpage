import React, { useState } from 'react';
import { BsPerson } from 'react-icons/bs';

const SignupButton = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div>
      <div className="relative">
        <BsPerson
          className="h-6 w-6 cursor-pointer"
          onClick={handleMenuToggle}
        />

        {menuOpen && (
          <div className="absolute right-0 top-0 bg-white rounded-md w-32 mt-2 py-2 shadow-lg">
            <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              Log in
            </div>
            <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              Sign in
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupButton;
