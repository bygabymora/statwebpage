import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  BiHomeSmile,
  BiUser,
  BiPhotoAlbum,
  BiGridVertical,
  BiXCircle,
} from 'react-icons/bi';
import { MdOutlineWavingHand } from 'react-icons/md';
import { useRouter } from 'next/router';
import { TbShoppingCartDiscount } from 'react-icons/tb';

const Navbar = () => {
  const [hasClearanceProducts] = useState(false);
  const router = useRouter();
  const [toggleMenu, setToggleMenu] = useState(false);

  const toggleMenuHandler = () => {
    setToggleMenu(!toggleMenu);
  };

  useEffect(() => {
    const fetchClearanceProducts = async () => {
      try {
        const response = await axios.get('/api/clearance');
        console.log('Clearance response:', response); // Verify that the response is correct 
        if (response.data) {
          console.log('Productos en clearance:', response.data.clearanceProducts);
        } else {
          console.error('API did not return valid data');
        }
      } catch (error) {
        console.error('Error fetching clearance products:', error);
      }
    };
  
    fetchClearanceProducts();
  }, []);

  const handleLinkClick = (section) => {
    if (window.innerWidth >= 800) {
      const yOffsetLargeScreen = -170;
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) { // Check if the element exists
          const y =
            element.getBoundingClientRect().top +
            window.scrollY +
            yOffsetLargeScreen;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          console.error(`Element with id "${section}" not found.`);
        }
      }, 200);
    } else {
      const yOffsetSmallScreen = -50;
      setTimeout(() => {
        const path = `/#${section}`;
        router.push(path);
        const element = document.getElementById(section);
        if (element) { 
          const y =
            element.getBoundingClientRect().top +
            window.scrollY +
            yOffsetSmallScreen;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          console.error(`Element with id "${section}" not found.`);
        }
      }, 200);
    }
  };
  
  const handleHomeClick = () => {
    // Check if the current route is the home page
    if (router.pathname === '/') {
      router.reload();
    } else {
      router.push('/');
    }
  };

  return (
    <div>
      <div className={toggleMenu ? 'nav__menu show-menu' : 'nav__menu'}>
        <div className="nav__list grid">
          <Link href="/" className="nav__link" onClick={handleHomeClick}>
            <BiHomeSmile className="uil uil-estate nav__icon" />
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
          <Link
            href="/clearance"
            className={
              hasClearanceProducts ? 'nav__link text-red-500' : 'hidden'
            }
          >
            <TbShoppingCartDiscount
              className={
                hasClearanceProducts
                  ? 'uil uil-scenery nav__icon text-red-500'
                  : 'hidden'
              }
            />
            <span className={hasClearanceProducts ? 'text-red-500' : ''}>
              Clearance
            </span>
          </Link>
          <Link href="/news" className="nav__link">
            <BiPhotoAlbum className="uil uil-scenery nav__icon" />
            News
          </Link>

          <br className="break" />
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
