import React, { useState } from "react";
import Link from "next/link";
import {
  BiHomeSmile,
  BiUser,
  BiNews,
  BiSolidPackage,
  BiGridVertical,
  BiXCircle,
} from "react-icons/bi";
import { MdOutlineWavingHand } from "react-icons/md";
import { useRouter } from "next/router";

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
        if (element) {
          // Check if the element exists
          const y =
            element.getBoundingClientRect().top +
            window.scrollY +
            yOffsetLargeScreen;
          window.scrollTo({ top: y, behavior: "smooth" });
        } else {
          console.error(`Element with id "${section}" not found.`);
        }
      }, 2000);
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
          window.scrollTo({ top: y, behavior: "smooth" });
        } else {
          console.error(`Element with id "${section}" not found.`);
        }
      }, 2000);
    }
  };

  const handleHomeClick = () => {
    // Check if the current route is the home page
    if (router.pathname === "/") {
      router.reload();
    } else {
      router.push("/");
    }
  };

  return (
    <div>
      <span className='block md:hidden'>
        <div className={toggleMenu ? "nav__menu show-menu" : "nav__menu"}>
          <div className='nav__list grid'>
            <Link
              href='/'
              title='Home - surgery Equipment & Healthcare Solutions'
              className='nav__link'
              onClick={handleHomeClick}
            >
              <BiHomeSmile className='uil uil-estate nav__icon' />
              Home
            </Link>
            <Link
              href='/about'
              className='nav__link'
              title='About Us - Company Profile & Mission'
            >
              <BiUser className='uil uil-user nav__icon' />
              About
            </Link>
            <Link href='/products' title='Products' className='nav__link'>
              <BiSolidPackage className='uil uil-scenery nav__icon' />
              Products
            </Link>
            <Link
              href='/#contact'
              title='Get in Touch - Customer Service'
              onClick={() => handleLinkClick("contact")}
              className='nav__link'
            >
              <MdOutlineWavingHand className='uil uil-message nav__icon' />
              Contact
            </Link>
            <Link href='/news' title='News' className='nav__link'>
              <BiNews className='uil uil-scenery nav__icon' />
              News
            </Link>

            <br className='break' />
          </div>
          <BiXCircle
            className='uil uil-times nav__close'
            onClick={toggleMenuHandler}
          />
        </div>
        <div className='nav__toggle' onClick={toggleMenuHandler}>
          <BiGridVertical className='uil uil-apps' />
        </div>
      </span>
    </div>
  );
};

export default Navbar;
