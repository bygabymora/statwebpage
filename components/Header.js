'use client';
import Signupbutton from './Signupbutton';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import Logo from '../public/images/assets/logo2.png';
import Logo2 from '../public/images/assets/logo.png';
import Navbar from './Navbar';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import { BiSearch } from 'react-icons/bi';

const Header = () => {
  const router = useRouter();
  const { state } = useContext(Store);
  const { cart } = state;
  const [cartItemsCount, setCarItemsCount] = useState(0);
  useEffect(() => {
    setCarItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

  const handleHomeClick = () => {
    // Check if the current route is the home page
    if (router.pathname === '/') {
      router.reload();
    } else {
      router.push('/');
    }
  };
  return (
    <header className="header">
      <nav className="nav container text-center flex-row-reverse ">
        <div className="search-field flex col-span-2 text-center ml-4 mr-4">
          <input
            type="text"
            className="bg-transparent border-b-2 border-blue-900 outline-none focus:bg-white focus:border-blue-900 md:ml-4 w-full"
            placeholder="Search..."
          />
          <button
            className="nav__search-button"
            onClick={() => router.push('/')}
          >
            <BiSearch className="nav__search-icon" />
          </button>
        </div>
        <div className="flex h-12 items-center">
          <div className="flex h-12 items-center">
            <Link href="/" className="nav__logo logo" onClick={handleHomeClick}>
              <div className="r__logo r__logo-1">
                <Image src={Logo2} alt="logo" width={500} />
              </div>
            </Link>
            <Link
              href="/"
              className="nav__logo_2 logo"
              onClick={handleHomeClick}
            >
              <div className="r__logo r__logo-2">
                <Image src={Logo} alt="logo" width={400} />
              </div>
            </Link>
          </div>

          <div className="nav-reverse flex h-12 place-items-center gap-4">
            <div className="flex h-12 items-center">
              <Link
                href={{ pathname: '/cart' }}
                className="flex text-xl font-bold p-2"
              >
                <BsCart2 />
              </Link>
              {cartItemsCount > 0 && (
                <sub
                  className="cart-badge"
                  onClick={() => router.push('/cart')}
                >
                  {cartItemsCount}
                </sub>
              )}
            </div>

            <Signupbutton />
            <Navbar />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
