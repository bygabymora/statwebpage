import React, { useContext, useEffect, useState } from 'react';
import { Store } from '../utils/Store';
import Link from 'next/link';

const CookieAcceptancePopup = () => {
  const { state, dispatch } = useContext(Store);
  const [isClient, setIsClient] = useState(false);
  const [isTop, setIsTop] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setIsTop(window.innerWidth <= 640); // example breakpoint for "small devices"
      const handleResize = () => {
        setIsTop(window.innerWidth <= 640);
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isClient]);

  if (!isClient || state.cookieAccepted) {
    return null;
  }

  const declineCookies = () => {
    dispatch({ type: 'ACCEPT_COOKIES' });
  };

  return (
    <div
      className={`${
        isTop ? 'top-0' : 'bottom-0'
      } fixed left-0 w-full p-6 bg-gray-500 bg-opacity-70 backdrop-blur-md shadow-md text-white z-50`}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-center md:text-left">
            We use cookies to enhance your experience. By continuing to use our
            website, you agree to our cookies use.
           <Link href="/privacy-policy" className="text-white hover:underline">Learn more</Link>
          </p>
          <div className="flex space-x-4">
            <button
              className="px-5 py-2 bg-green-800 hover:bg-titlecolordark text-white rounded-full hover:shadow-lg hover:text-black transition duration-300 ease-in-out"
              onClick={() => dispatch({ type: 'ACCEPT_COOKIES' })}
            >
              I Understand
            </button>
            <button
              className="px-5 py-2 bg-red-300 hover:bg-red-100 text-black rounded-full hover:shadow-lg transition duration-300 ease-in-out"
              onClick={declineCookies}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieAcceptancePopup;
