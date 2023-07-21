import React, { useState } from 'react';
import Link from 'next/link';
import {
  BiHomeHeart,
  BiUser,
  BiPhotoAlbum,
  BiGridVertical,
  BiXCircle,
  BiSearch,
} from 'react-icons/bi';
import { MdOutlineWavingHand } from 'react-icons/md';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const [toggleMenu, setToggleMenu] = useState(false);

  const toggleMenuHandler = () => {
    setToggleMenu(!toggleMenu);
  };

  const handleLinkClick = (section) => {
    if (window.innerWidth >= 800) {
      const yOffsetLargeScreen = -170;
      setTimeout(() => {
        const element = document.getElementById(section);
        const y =
          element.getBoundingClientRect().top +
          window.scrollY +
          yOffsetLargeScreen;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 200);
    } else {
      const yOffsetSmallScreen = -50;
      setTimeout(() => {
        const path = `/#${section}`; // Construct anchor link with #
        router.push(path);
        const element = document.getElementById(section);
        const y =
          element.getBoundingClientRect().top +
          window.scrollY +
          yOffsetSmallScreen;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 200);
    }
  };

  return (
    <div>
      <div className={toggleMenu ? 'nav__menu show-menu' : 'nav__menu'}>
        <div className="nav__list grid">
          <Link href="/" className="nav__link">
            <BiHomeHeart className="uil uil-estate nav__icon" />
            Home
          </Link>
          <Link href="/about" className="nav__link">
            <BiUser className="uil uil-user nav__icon" />
            About
          </Link>
          <Link href="/products" className="nav__link">
            <BiPhotoAlbum className="uil uil-scenery nav__icon" />
            Products
          </Link>
          <Link
            href="/#contact"
            onClick={() => handleLinkClick('contact')}
            className="nav__link"
          >
            <MdOutlineWavingHand className="uil uil-message nav__icon" />
            Contact
          </Link>
          <br className="break" />
          <div className="flex col-span-2 text-center ml-4 mr-4">
            <input
              type="text"
              className="bg-transparent border-b-2 border-blue-800 outline-none focus:bg-white focus:border-blue-800 md:ml-4 w-full"
              placeholder="Search..."
            />
            <button
              className="nav__search-button"
              onClick={() => router.push('/')}
            >
              <BiSearch className="nav__search-icon" />
            </button>
          </div>
        </div>
        <BiXCircle
          className="uil uil-times nav__close"
          onClick={toggleMenuHandler}
        />
      </div>
      <div className="nav__toggle" onClick={toggleMenuHandler}>
        <BiGridVertical className="uil uil-apps" />
      </div>
    </div>
  );
};

export default Navbar;
