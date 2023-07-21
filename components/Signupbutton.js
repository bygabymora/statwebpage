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
      <Menu as="div" className="flex-col flex items-center w-fit h-full">
        <Menu.Button className="font-bold">
          <BsPerson
            className="h-6 w-6  cursor-pointer place-self-center"
            onClick={handleMenuToggle}
          />
        </Menu.Button>

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
              <>
                <Menu.Items className="bg-white grid grid-cols-1 dropdown-menu">
                  <div className="font-bold ml-2">
                    Hello! {session.user.name}
                  </div>
                  <Menu.Item>
                    <DropdownLink href="/profile" className="dropdown-link">
                      Profile
                    </DropdownLink>
                  </Menu.Item>
                  <Menu.Item className="dropdown-link">
                    <DropdownLink href="/order-history">
                      Order History
                    </DropdownLink>
                  </Menu.Item>
                  {session.user.isAdmin && (
                    <Menu.Item className="dropdown-link ">
                      <div>
                        <DropdownLink href="/admin/dashboard">
                          Admin Dashboard
                        </DropdownLink>
                      </div>
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
              </>
            ) : (
              <>
                <Menu.Items className="bg-white grid grid-cols-1 dropdown-menu">
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
              </>
            )}
          </div>
        )}
      </Menu>
    </div>
  );
};

export default SignupButton;
