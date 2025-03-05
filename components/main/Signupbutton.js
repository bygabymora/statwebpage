import React, { useContext, useState, useEffect, useRef } from 'react';
import { BsPerson } from 'react-icons/bs';
import { signOut, useSession } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import DropdownLink from '../DropdownLink';
import Cookies from 'js-cookie';
import { Store } from '../../utils/Store';

const SignupButton = () => {
  const { status, data: session } = useSession();
  const { dispatch } = useContext(Store);
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

  const logoutClickHandler = () => {
    Cookies.remove('cart');
    dispatch({ type: 'CART_RESET' });
    signOut({ callbackUrl: '/Login' });
  };

  return (
    <div className="relative">
      <Menu as="div" className="flex items-center">
        <Menu.Button className="p-2" aria-label="user">
          <BsPerson className="h-6 w-6 cursor-pointer" onClick={handleMenuToggle} />
        </Menu.Button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-12 right-0 w-40 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200"
            role="menu"
            aria-orientation="vertical"
          >
            {status === 'loading' ? (
              <div className="p-4 text-center text-gray-700">Loading...</div>
            ) : session?.user ? (
              <Menu.Items className="divide-y divide-gray-200">
                <div className="px-4 py-2 text-sm text-[#03793d] font-semibold">Hello, {session.user.name}</div>
                <Menu.Item>
                  <DropdownLink href="/profile" className="block px-4 py-2 hover:bg-[#f4f4f4]">Profile</DropdownLink>
                </Menu.Item>
                <Menu.Item>
                  <DropdownLink href="/order-history" className="block px-4 py-2 hover:bg-[#f4f4f4]">Order History</DropdownLink>
                </Menu.Item>
                {session.user.isAdmin && (
                  <Menu.Item>
                    <DropdownLink href="/admin/dashboard" className="block px-4 py-2 hover:bg-[#f4f4f4]">Admin Dashboard</DropdownLink>
                  </Menu.Item>
                )}
                <Menu.Item>
                  <button
                    onClick={logoutClickHandler}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    Log Out
                  </button>
                </Menu.Item>
              </Menu.Items>
            ) : (
              <Menu.Items>
                <Menu.Item>
                  <DropdownLink href="/Login" className="block px-4 py-2 hover:bg-[#f4f4f4]">Login</DropdownLink>
                </Menu.Item>
                <Menu.Item>
                  <DropdownLink href="/Register" className="block px-4 py-2 hover:bg-[#f4f4f4]">Register</DropdownLink>
                </Menu.Item>
              </Menu.Items>
            )}
          </div>
        )}
      </Menu>
    </div>
  );
};

export default SignupButton;
