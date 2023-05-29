'use client';
import Signupbutton from './Signupbutton';
import React from 'react';
import Link from 'next/link';
import { BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import Logo from '../../assets/logo2.png';
import Logo2 from '../../assets/logo.png';
import '../styles/header.css';
import Navbar from './Navbar';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav container">
        <div className="flex h-12 items-center">
          <div className="flex h-12 items-center">
            <Link href="/" className="nav__logo logo">
              <div className="r__logo r__logo-1">
                <Image src={Logo2} alt="logo" width={500} />
              </div>
            </Link>
            <Link href="/" className="nav__logo_2 logo">
              <div className="r__logo r__logo-2">
                <Image src={Logo} alt="logo" width={400} />
              </div>
            </Link>
          </div>

          <div className="nav-reverse flex h-12 place-items-center gap-4">
            <Link href="/cart" className="text-xl font-bold p-2">
              <BsCart2 />
            </Link>
            <Signupbutton />
            <Navbar />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
