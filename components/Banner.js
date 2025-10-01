import React, { useState, useEffect } from "react";
import Image from "next/image";
import Banner1 from "../public/images/assets/banner1.jpg";
import Banner2 from "../public/images/assets/banner2.svg";
import Banner3 from "../public/images/assets/banner3.webp";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LuShieldCheck,
  LuActivity,
  LuPackageCheck,
  LuPhoneForwarded,
} from "react-icons/lu";

const Banner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [Banner1, Banner2, Banner3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className='text-title-color-dark text-center'>
      <div className='grid lg:grid-cols-2 md:grid-cols-1 banner-container mx-auto px-4 items-center'>
        <div className='text-left -mt-5'>
          <h1 className='text-3xl sm:text-6xl md:text-6xl text-center lg:text-5xl font-bold leading-tight drop-shadow-md text-[#0e355e] -md:-mt-10'>
            Quality &amp; Precision in{" "}
            <span className='text-[#03793d]'>Surgical Supplies</span>
          </h1>

          <p className='text-[#414b53de] text-base font-normal text-center mb-6 my-5'>
            Your Trusted Source for Surgical Supplies. Trusted by more than 150+
            healthcare facilities. High-quality at unmatched prices. Explore our
            wide range of premium surgical disposables, implants, and
            instruments. We offer industry-leading brands with cost-saving
            solutions tailored to your healthcare needs.
          </p>

          <div className='flex flex-wrap gap-10 justify-center text-center max-w-3xl text-white my-5'>
            <div className='flex flex-col items-center flex-shrink-0'>
              <div className='flex items-center justify-center text-[#0e355e] gap-2 mb-5'>
                <LuShieldCheck
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  aria-hidden
                />
                <span>Certified suppliers</span>
              </div>
              <Link href='/products'>
                <motion.button
                  className='inline-flex items-center justify-center rounded-2xl border-0 px-6 py-3 text-sm font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#144e8b] bg-[#144e8b] hover:bg-[#5b8756] transition-colors'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LuPackageCheck size={19} className='relative top-[1px]' />
                  View Catalog
                </motion.button>
              </Link>
            </div>

            <div className='flex flex-col items-center flex-shrink-0'>
              <div className='flex items-center justify-center text-[#0e355e] gap-2 mb-5'>
                <LuActivity
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  aria-hidden
                />
                <span>Fast &amp; guaranteed shipping</span>
              </div>
              <Link href='/#contact'>
                <motion.button
                  className='inline-flex items-center justify-center rounded-2xl border-[#03793d] px-6 py-3 text-sm font-semibold shadow-lg hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#07783e] bg-[#07783e] hover:bg-[#144e8b] transition-colors'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LuPhoneForwarded size={19} className='relative top-[1px]' />
                  Contact Sales
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
        <div className='relative w-full max-w-[500px] aspect-[1/1] mx-auto'>
          {banners.map((banner, index) => (
            <motion.div
              key={index}
              className='absolute inset-0'
              initial={false}
              animate={{ opacity: index === currentBanner ? 1 : 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{
                pointerEvents: index === currentBanner ? "auto" : "none",
              }}
            >
              <Image
                src={banner}
                alt='Premium online Equipment for Hospitals and Clinics'
                title='Buy Hospital & Clinic Equipment - healthcare equipment'
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : undefined}
                sizes='(max-width: 768px) 330px, (max-width: 1024px) 500px, 500px'
                className='rounded-lg object-cover'
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
