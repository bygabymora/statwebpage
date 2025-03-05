import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Banner1 from '../public/images/assets/banner1.svg';
import Banner2 from '../public/images/assets/banner2.svg';
import Banner3 from '../public/images/assets/banner3.svg';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AiOutlineSend } from 'react-icons/ai';
import { motion } from 'framer-motion';

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
      }, 2000);
    } else {
      const yOffsetSmallScreen = -50;
      setTimeout(() => {
        const path = `/#${section}`;
        router.push(path);
        const element = document.getElementById(section);
        const y =
          element.getBoundingClientRect().top +
          window.scrollY +
          yOffsetSmallScreen;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 2000);
    }
  };

  return (
    <div className="text-title-color-dark text-center ">
      <div className="grid lg:grid-cols-2 md:grid-cols-1  banner-container mx-auto px-4 py-8 items-center">
        <div className="">
          <h1 className="text-4xl font-bold mb-4">Welcome to STAT Surgical Supply</h1>
          <div className="text-lg text-text-color">
            {audience === 'hospital' ? (
              <>
                We provide high-quality surgical supplies to meet the needs of healthcare professionals. Partner with us to save thousands on the same devices you purchase direct.
                <br />
                <span>&nbsp;&nbsp;</span>
                <Link href="/products" className="flex justify-center items-center font-bold text-[#03793d]">
                  <span className="underline">Go Shopping!</span>
                  <span>&nbsp;&nbsp;</span>
                  <AiOutlineSend className="link-space"/>
                </Link>
              </>
            ) : audience === 'manufacturer' ? (
              <>
                Partner with us to expand your market reach in two ways. We provide cost savings on the same devices you are purchasing direct. Additionally, we buy your excess inventory.
                <br />
                <span>&nbsp;&nbsp;</span>
                <Link href="/ManufacturerForm" className="flex justify-center items-center font-bold text-[#03793d]">
                  <span className="underline">Send us your list</span>
                  <span>&nbsp;&nbsp;</span>
                  <AiOutlineSend className="link-space" />
                </Link>
              </>
            ) : (
              <div className="mb-10">Explore our wide range of high-end surgical disposables.</div>
            )}
          </div>
          {audience !== '' && (
            <div className="flex gap-4 justify-center mt-10">
              <motion.button
                onClick={handleCallButtonClick}
                className="equal-button-size btn-call sm:inline-block block mr-4 mb-4 sm:mb-0 text-white bg-title-color-dark hover:bg-title-color px-6 py-3 rounded lg:hidden shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Call Now
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link
                  href="#contact"
                  className="equal-button-size btn-contact hover:text-white sm:inline-block block px-6 py-3 rounded lg:text-center shadow-md border border-title-color-dark"
                  onClick={() => handleLinkClick('contact')}
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          )}
          {audience === '' && (
            <div>
              <h1 className="text-2xl">Who are you?</h1>
              <br />
              <div className="grid grid-cols-2 cart-button items-center mb-8 text-center sm:text-xs">
                <motion.button
                  onClick={() => handleAudienceSelection('hospital')}
                  className="btn-audience equal-button-size sm:inline-block block mr-4 mb-4 sm:mb-0 text-white bg-title-color-dark hover:bg-title-color px-6 py-3 rounded md:text-sm text-center shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  Hospital, ASC, or <br /> Medical Facility
                </motion.button>
                <motion.button
                  onClick={() => handleAudienceSelection('manufacturer')}
                  className="btn-audience equal-button-size sm:inline-block block mr-4 mb-4 sm:mb-0 text-white bg-title-color-dark hover:bg-title-color px-6 py-3 rounded md:text-sm text-center shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  Distributor <br /> or Manufacturer
                </motion.button>
              </div>
            </div>
          )}
        </div>
          <div className="image-container">
            {audience === 'hospital' ? (
              <Image className="image-container-image" src={Banner2} alt="Banner" width={500} height={500} quality={5} />
            ) : audience === 'manufacturer' ? (
              <Image className="image-container-image" src={Banner3} alt="Banner" width={500} height={500} quality={5} />
            ) : (
              <Image className="image-container-image" src={Banner1} alt="Banner" width={500} height={500} quality={5} />
            )}
          </div>
      </div>
    </div>
  );
};

export default Banner;
