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

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);

  const toggleMenuHandler = () => {
    setToggleMenu(!toggleMenu);
  };

  return (
    <div>
      <div className={toggleMenu ? 'nav__menu show-menu' : 'nav__menu'}>
        <div className="nav__list grid">
          <Link href="/" className="nav__link active-link">
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
          <Link href="/contact" className="nav__link">
            <MdOutlineWavingHand className="uil uil-message nav__icon" />
            Contact
          </Link>

          <input
            type="text"
            className="bg-transparent border-b-2 border-blue-800 outline-none focus:bg-white focus:border-blue-800"
            placeholder="Search..."
          />
          <button className="nav__search-button">
            <BiSearch className="nav__search-icon" />
          </button>
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
