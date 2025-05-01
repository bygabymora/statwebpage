import React, { useState, useEffect } from "react";
import Image from "next/image";
import Banner1 from "../public/images/assets/banner1.webp";
import Banner2 from "../public/images/assets/banner2.svg";
import Banner3 from "../public/images/assets/banner3.svg";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiPhoneForwarded } from "react-icons/fi";
import { TiShoppingCart } from "react-icons/ti";

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
        <div className='text-left'>
          <div className='text-4xl font-bold mb-6 text-[#144e8b]'>
            Welcome to STAT Surgical Supply
          </div>
          <p className='text-lg text-[#414b53de] text-center mb-6'>
            High-Quality Surgical Supplies at Unmatched Prices. <br />
            Explore our wide range of high-end surgical disposables. We offer
            industry-leading brands with cost-saving solutions.
          </p>

          <div className='flex flex-wrap gap-4 justify-center text-center w-full'>
            <Link href='/products' className='w-full sm:w-auto'>
              <motion.button
                className='w-full sm:w-auto bg-[#03793d] text-white px-6 py-3 rounded shadow-md hover:bg-green-700 transition-all flex items-center justify-center gap-3'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TiShoppingCart />
                Shop Now
              </motion.button>
            </Link>

            <Link href='/#contact' className='w-full sm:w-auto'>
              <motion.button
                className='w-full sm:w-auto border border-[#03793d] text-[#03793d] px-6 py-3 rounded shadow-md hover:bg-[#03793d] hover:text-white transition-all flex items-center justify-center gap-3'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPhoneForwarded />
                Contact Us
              </motion.button>
            </Link>
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
                alt='Surgical Supplies'
                fill
                priority={index === 0}
                className='rounded-lg object-cover'
                sizes='(max-width: 768px) 330px, (max-width: 1024px) 500px, 500px'
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
