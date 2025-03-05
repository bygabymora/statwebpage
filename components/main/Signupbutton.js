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
      <Menu as="div" className="flex-col flex items-center w-fit h-full">
        <Menu.Button className="font-bold" aria-label="user">
          <BsPerson
            className="h-6 w-6  cursor-pointer place-self-center"
            onClick={handleMenuToggle}
          />
        </Menu.Button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-12 right-0 w-32 mt-2 bg-white rounded-md shadow-lg z-10"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {status === 'loading' ? (
              'Loading'
            ) : session?.user ? (
              <Menu.Items className="bg-white grid grid-cols-1">
                <div className="font-bold p-2">Hello! {session.user.name}</div>
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
                {session.user.isAdmin && (
                  <Menu.Item>
                    <DropdownLink href="/admin/dashboard" className="dropdown-link">
                      Admin Dashboard
                    </DropdownLink>
                  </Menu.Item>
                )}
                <Menu.Item>
                  <DropdownLink
                    href="/"
                    className="dropdown-link font-bold"
                    onClick={logoutClickHandler}
                  >
                    Log Out
                  </DropdownLink>
                </Menu.Item>
              </Menu.Items>
            ) : (
              <Menu.Items className="bg-white grid grid-cols-1">
                <Menu.Item>
                  <DropdownLink href="/Login" className="dropdown-link">
                    Login
                  </DropdownLink>
                </Menu.Item>
                <Menu.Item>
                  <DropdownLink href="/Register" className="dropdown-link">
                    Register
                  </DropdownLink>
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