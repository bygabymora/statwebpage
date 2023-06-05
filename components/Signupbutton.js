import React, { useState, useEffect, useRef } from 'react';
import { BsPerson } from 'react-icons/bs';

const SignupButton = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const menuStyle = {
    position: 'absolute',
    top: '-120%',
    right: 0,
    width: '8rem',
    marginTop: '0.5rem',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#fff',
    borderRadius: '0.375rem',
    zIndex: 10,
  };

  return (
    <div className="relative">
      <BsPerson className="h-6 w-6 cursor-pointer" onClick={handleMenuToggle} />

      {menuOpen && (
        <div
          ref={menuRef}
          style={menuStyle}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            <div
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Log in
            </div>
            <div
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Sign in
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupButton;
