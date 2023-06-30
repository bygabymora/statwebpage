import Link from 'next/link';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { BsPerson } from 'react-icons/bs';
import { signOut, useSession } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import DropdownLink from './DropdownLink';
import Cookies from 'js-cookie';
import { Store } from '../utils/Store';

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

  const logoutClickHandler = () => {
    Cookies.remove('cart');
    dispatch({ type: 'CART_RESET' });
    signOut({ callbackUrl: '/Login' });
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
          {status === 'loading' ? (
            'Loading'
          ) : session?.user ? (
            <Menu
              as="div"
              className="flex-col flex relative items-center w-fit h-full py-4"
            >
              <Menu.Button className="font-bold user-name">
                {session.user.name}
              </Menu.Button>
              <Menu.Items className="bg-white grid grid-cols-1 dropdown-menu">
                <Menu.Item>
                  <DropdownLink href="/profile" className="dropdown-link">
                    Profile
                  </DropdownLink>
                </Menu.Item>
                <Menu.Item>
                  <DropdownLink href="/order-history" className="dropdown-link">
                    Order History
                  </DropdownLink>
                </Menu.Item>
                <Menu.Item>
                  <DropdownLink
                    href="/"
                    className="dropdown-link"
                    onClick={logoutClickHandler}
                  >
                    Log Out
                  </DropdownLink>
                </Menu.Item>
              </Menu.Items>
            </Menu>
          ) : (
            <>
              <div className="py-1" role="none">
                <Link
                  href="/Login"
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                >
                  Login
                </Link>
                <Link
                  href="/Register"
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                >
                  Signin
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SignupButton;
