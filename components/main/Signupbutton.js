import React, { useContext, useState, useEffect, useRef } from "react";
import { BsPerson } from "react-icons/bs";
import { signOut, useSession } from "next-auth/react";
import Cookies from "js-cookie";
import { Store } from "../../utils/Store";
import Link from "next/link";
const SignupButton = () => {
  const { status, data: session } = useSession();
  const { dispatch } = useContext(Store);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const active =
    session?.user?.active &&
    session?.user?.approved &&
    status === "authenticated";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const logoutClickHandler = () => {
    Cookies.remove("cart");
    dispatch({ type: "CART_RESET" });
    signOut({ callbackUrl: "/Login" });
  };

  return (
    <div className='relative'>
      <div className='flex items-center w-fit h-full'>
        <button
          className='relative font-bold flex items-center group'
          aria-label='user'
          onClick={(e) => {
            e.preventDefault();
            handleMenuToggle();
          }}
        >
          {/* User Icon (Unchanged Size) */}
          <BsPerson className='font-bold text-[2rem] text-[#03793d] cursor-pointer place-self-center' />
        </button>

        {menuOpen && (
          <div
            className='absolute bottom-full mb-2 right-0 w-40 bg-white rounded-lg shadow-lg z-[9999] overflow-hidden border border-gray-200 sm:top-12 sm:bottom-auto sm:mb-0 left-1/2 -translate-x-1/2 sm:right-auto'
            ref={menuRef}
            role='menu'
            aria-orientation='vertical'
          >
            {status === "loading" ? (
              <div className='p-4 text-center text-gray-700'>Loading...</div>
            ) : session?.user ? (
              <>
                <div className='px-4 py-2 text-sm text-[#03793d] font-semibold'>
                  Hello, {session.user.name}
                </div>
                <div className='block px-4 py-2 text-sm'>
                  <Link
                    href='/profile'
                    className='block px-4 py-2 hover:bg-[#f4f4f4]'
                  >
                    Profile
                  </Link>
                </div>
                {active === "loading"
                  ? "Loading"
                  : active && (
                      <div className='block px-4 py-2 text-sm'>
                        <Link
                          href='/order-history'
                          className='block px-4 py-2 hover:bg-[#f4f4f4]'
                        >
                          Order History
                        </Link>
                      </div>
                    )}
                {session.user?.isAdmin && (
                  <div className='block px-4 py-2 text-sm'>
                    <Link
                      href='/admin/dashboard'
                      className='block px-4 py-2 hover:bg-[#f4f4f4]'
                    >
                      Admin Dashboard
                    </Link>
                  </div>
                )}
                <div className='block px-4 py-2 text-sm font-bold'>
                  <Link href='/' onClick={logoutClickHandler}>
                    Log Out
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className='block px-4 py-2 text-sm'>
                  <Link href='/Login'>Login</Link>
                </div>
                <div className='block px-4 py-2 text-sm'>
                  <Link href='/Register'>Register</Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupButton;
