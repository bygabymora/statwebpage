import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AiOutlineSend } from 'react-icons/ai';

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
      <div className="grid lg:grid-cols-2 md:grid-cols-1  banner-container mx-auto px-4 py-8 items-center">
        <div className="">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to STAT Surgical Supply
          </h1>
          <div className="text-lg text-text-color">
            {audience === 'hospital' ? (
              <>
                We provide high-quality surgical supplies to meet the needs of
                healthcare professionals. Partner with us to save thousands on
                the same devices you purchase direct.
                <br />
                <Link
                  href="/products"
                  className="flex justify-center items-center font-bold"
                >
                  <span className="underline ">Go Shopping!</span>
                  <span>&nbsp;&nbsp;</span>
                  <AiOutlineSend className="link-space-1" />
                </Link>
              </>
            ) : audience === 'manufacturer' ? (
              <>
                Partner with us to expand your market reach in two ways. We
                provide cost savings on the same devices you are purchasing
                direct. Additionally, we will buy your excess inventory.
                <br />
                <Link
                  href="/ManufacturerForm"
                  className="flex justify-center items-center font-bold"
                >
                  <span className="underline ">Send us your list</span>
                  <span>&nbsp;&nbsp;</span>
                  <AiOutlineSend className="link-space-1" />
                </Link>
              </>
            ) : (
              <div className="mb-10">
                Explore our wide range of high-end surgical disposables.
              </div>
            )}
          </div>
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
              <div className="grid grid-cols-2 cart-button items-center mb-8 text-center sm:text-xs">
                <button
                  onClick={() => handleAudienceSelection('hospital')}
                  className="btn-audience equal-button-size sm:inline-block block mr-4 mb-4 sm:mb-0 text-white bg-title-color-dark hover:bg-title-color px-6 py-3 rounded md:text-sm text-center"
                >
                  Hospital, ASC, or
                  <br />
                  Medical Facility
                </button>
                <button
                  onClick={() => handleAudienceSelection('manufacturer')}
                  className="btn-audience equal-button-size sm:inline-block block mr-4 mb-4 sm:mb-0 text-white bg-title-color-dark hover:bg-title-color px-6 py-3 rounded md:text-sm text-center"
                >
                  Distributor
                  <br /> or Manufacturer
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="image-container">
          {audience === 'hospital' ? (
            <Image
              className="image-container-image"
              src="https://res.cloudinary.com/dcjahs0jp/image/upload/v1697726828/dfvqknrmjnenpovsdq4z.png"
              alt="Banner"
              width={500}
              height={500}
              quality={5}
              loading="eager"
            />
          ) : audience === 'manufacturer' ? (
            <Image
              className="image-container-image"
              src="https://res.cloudinary.com/dcjahs0jp/image/upload/v1697726846/ozhyfajx211qympvqnrp.png"
              alt="Banner"
              width={500}
              height={500}
              quality={5}
              loading="eager"
            />
          ) : (
            <Image
              className="image-container-image"
              src="https://res.cloudinary.com/dcjahs0jp/image/upload/v1697726722/co9sefc62taygygn7y9z.png"
              alt="Banner"
              width={500}
              height={500}
              loading="eager"
              quality={5}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;
