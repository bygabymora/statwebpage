import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// Inline SVG icons — eliminates react-icons/bi and react-icons/md
// from the shared header bundle on every page
function HomeIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm9-8.586 6 6V15l.001 5H6v-9.586l6-6z' />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z' />
    </svg>
  );
}

function NewsIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M19.875 3H4.125C2.953 3 2 3.897 2 5v14c0 1.103.953 2 2.125 2h15.75C21.047 21 22 20.103 22 19V5c0-1.103-.953-2-2.125-2zm0 16H4.125c-.057 0-.096-.016-.113-.016-.007 0-.011.002-.012.008L3.988 5.046c.007-.01.052-.046.137-.046h15.75c.079.001.122.028.125.046l.012 13.946c-.007.01-.052.054-.137.054zM6 7h6v6H6zm8 0h4v2h-4zm0 4h4v2h-4zm-8 4h12v2H6z' />
    </svg>
  );
}

function PackageIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M22 8a.76.76 0 0 0 0-.21v-.08a.77.77 0 0 0-.07-.16.35.35 0 0 0-.05-.08l-.1-.13-.08-.06-.12-.09-9-5a1 1 0 0 0-1 0l-9 5-.09.07-.11.08a.41.41 0 0 0-.07.11.39.39 0 0 0-.08.1.59.59 0 0 0-.06.14.3.3 0 0 0 0 .1A.76.76 0 0 0 2 8v8a1 1 0 0 0 .52.87l9 5a.75.75 0 0 0 .13.06h.1a1.06 1.06 0 0 0 .5 0h.1a.75.75 0 0 0 .13-.06l9-5A1 1 0 0 0 22 16V8zm-10-3.87L17.27 8 12 11.87 6.73 8zM4 9.73l7 3.89v7.65l-7-3.89zm9 11.54v-7.65l7-3.89v7.65z' />
    </svg>
  );
}

function GridIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11-6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 6h-4V5h4v4zM10 13H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6H5v-4h4v4zm11-6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-4v-4h4v4z' />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.207 12.793-1.414 1.414L12 13.414l-2.793 2.793-1.414-1.414L10.586 12 7.793 9.207l1.414-1.414L12 10.586l2.793-2.793 1.414 1.414L13.414 12l2.793 2.793z' />
    </svg>
  );
}

function WavingHandIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M7.03 4.95c-.44 2.54-1.93 4.29-4.04 5.5L1.21 8.83C2.84 7.88 4.06 6.5 4.41 4.58c.22-1.27-.08-2-.56-2.47-.71-.71-1.84-.56-2.47.11l-1.58-1.27c1.34-1.61 3.87-2.25 5.88-.24.82.82 1.63 2.13 1.35 4.24zM13.85.96c-.56-.57-1.28-.68-1.82-.32-.55.36-.78.99-.5 1.64l4.66 10.53-3.22 1.42C12.76 13.36 12 12.62 11 12.62s-1.76.74-1.96 1.61l-3.22-1.42L10.47 2.3c.28-.65.04-1.28-.5-1.64-.55-.36-1.27-.25-1.82.32L3.38 5.87c-1 1.07-1.55 2.31-1.87 3.74-.32 1.37-.34 2.62-.05 3.94l.67 3.1c.39 1.78 1.46 3.38 3.09 4.21.37.19.76.34 1.19.45 1.09.28 2.48.37 3.78-.02.8-.24 1.62-.72 2.29-1.55l5.37-8.72c.37-.6.31-1.33-.17-1.76-.48-.43-1.21-.41-1.7.05l-1.84 2.07L8.96 2.17C8.86 1.95 8.82 1.75 8.86 1.56c.04-.19.17-.32.34-.4.17-.09.37-.09.55.01.17.1.28.27.35.46l5.3 11.96c.12.26.37.42.66.42.07 0 .14-.01.2-.03.36-.1.58-.47.48-.83L13.85.96z' />
    </svg>
  );
}

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
              <HomeIcon className='uil uil-estate nav__icon' />
              Home
            </Link>
            <Link
              href='/about'
              className='nav__link'
              title='About Us - Company Profile & Mission'
            >
              <UserIcon className='uil uil-user nav__icon' />
              About
            </Link>
            <Link href='/products' title='Products' className='nav__link'>
              <PackageIcon className='uil uil-scenery nav__icon' />
              Products
            </Link>
            <Link
              href='/#contact'
              title='Get in Touch - Customer Service'
              onClick={() => handleLinkClick("contact")}
              className='nav__link'
            >
              <WavingHandIcon className='uil uil-message nav__icon' />
              Contact
            </Link>
            <Link href='/news' title='News' className='nav__link'>
              <NewsIcon className='uil uil-scenery nav__icon' />
              News
            </Link>

            <br className='break' />
          </div>
          <CloseIcon
            className='uil uil-times nav__close'
            onClick={toggleMenuHandler}
          />
        </div>
        <div className='nav__toggle' onClick={toggleMenuHandler}>
          <GridIcon className='uil uil-apps' />
        </div>
      </span>
    </div>
  );
};

export default Navbar;
