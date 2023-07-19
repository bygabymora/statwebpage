import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Banner1 from '../public/images/assets/banner1.png';
import Banner2 from '../public/images/assets/banner2.png';
import Banner3 from '../public/images/assets/banner3.png';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Banner = () => {
  const router = useRouter();
  const [audience, setAudience] = useState('');

  const handleAudienceSelection = (selectedAudience) => {
    setAudience(selectedAudience);
  };

  useEffect(() => {
    const imageContainer = document.querySelector('.image-container');
    imageContainer.classList.add('fade-in-right');

    const animationDuration = 1000;
    setTimeout(() => {
      imageContainer.classList.remove('fade-in-right');
    }, animationDuration);
  }, [audience]);

  const handleCallButtonClick = () => {
    window.location.href = 'tel:8132520727';
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
    <div className="text-title-color-dark text-center ">
      <div className="grid lg:grid-cols-2 md:grid-cols-1 banner-container mx-auto px-4 py-8 items-center">
        <div className="">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to STAT Surgical Supply
          </h1>
          <p className="text-lg text-text-color">
            {audience === 'hospital' ? (
              <>
                We provide high-quality surgical supplies to meet the needs of
                healthcare professionals. Partner with us to save thousands on
                the same devices you purchase direct.
              </>
            ) : audience === 'manufacturer' ? (
              <>
                Partner with us to expand your market reach in two ways. We
                provide cost savings on the same devices you are purchasing
                direct. Additionally, we will buy your excess inventory.
              </>
            ) : (
              <>Explore our wide range of high-end surgical disposables.</>
            )}
          </p>
          {audience !== '' && (
            <div className="grid grid-cols-2 mt-8 w-full mb-8 text-center">
              <button
                href="tel:8132520727"
                onClick={handleCallButtonClick}
                className="equal-button-size btn-call sm:inline-block block mr-4 mb-4 sm:mb-0 text-white bg-title-color-dark hover:bg-title-color px-6 py-3 rounded lg:hidden"
              >
                Call Now
              </button>
              <Link
                href="#contact"
                className=" equal-button-size btn-contact hover:text-white sm:inline-block block px-6 py-3 rounded lg:text-center"
                onClick={() => handleLinkClick('contact')}
              >
                Contact Us
              </Link>
            </div>
          )}
          {audience === '' && (
            <div>
              <h1 className="text-2xl">Who are you?</h1>
              <br />
              <div className="grid grid-cols-2 cart-button items-center mb-8 text-center">
                <button
                  onClick={() => handleAudienceSelection('hospital')}
                  className="btn-audience equal-button-size sm:inline-block block mr-4 mb-4 sm:mb-0 text-white bg-title-color-dark hover:bg-title-color px-6 py-3 rounded md:text-sm text-center"
                >
                  Hospital, ASC, or Medical Facility
                </button>
                <button
                  onClick={() => handleAudienceSelection('manufacturer')}
                  className="btn-audience equal-button-size sm:inline-block block mr-4 mb-4 sm:mb-0 text-white bg-title-color-dark hover:bg-title-color px-6 py-3 rounded md:text-sm text-center"
                >
                  Distributor or Manufacturer
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="image-container">
          {audience === 'hospital' ? (
            <Image
              className="image-container-image"
              src={Banner2}
              alt="Banner"
            />
          ) : audience === 'manufacturer' ? (
            <Image
              className="image-container-image"
              src={Banner3}
              alt="Banner"
            />
          ) : (
            <Image
              className="image-container-image"
              src={Banner1}
              alt="Banner"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;
