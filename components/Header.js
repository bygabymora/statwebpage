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

const Header = () => {
  const router = useRouter();
  const { state } = useContext(Store);
  const { cart } = state;
  const [cartItemsCount, setCarItemsCount] = useState(0);
  useEffect(() => {
    setCarItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }),
    [cart.cartItems];

  return (
    <header className="header">
      <nav className="nav container">
        <div className="flex h-12 items-center">
          <div className="flex h-12 items-center">
            <Link href={{ pathname: '/' }} className="nav__logo logo">
              <div className="r__logo r__logo-1">
                <Image src={Logo2} alt="logo" width={500} />
              </div>
            </Link>
            <Link href={{ pathname: '/' }} className="nav__logo_2 logo">
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
