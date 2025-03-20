import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Banner1 from '../public/images/assets/banner1.svg';
import Banner2 from '../public/images/assets/banner2.svg';
import Banner3 from '../public/images/assets/banner3.svg';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhoneForwarded } from 'react-icons/fi';
import { TiShoppingCart } from "react-icons/ti";

const Banner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [Banner1, Banner2, Banner3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-title-color-dark text-center">
      <div className="grid lg:grid-cols-2 md:grid-cols-1 banner-container mx-auto px-4 py-12 items-center">
        
        <div className="text-left">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to STAT Surgical Supply
          </h1>
          <p className="text-lg text-text-color text-center mb-6">
            High-Quality Surgical Supplies at Unmatched Prices. <br />
            Explore our wide range of high-end surgical disposables. We offer industry-leading brands with cost-saving solutions.
          </p>

          <div className="flex gap-4 text-center justify-center">
            <motion.button
              className="bg-[#03793d] text-white px-6 py-3 rounded shadow-md hover:bg-green-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/products" className="flex items-center gap-3">
                <TiShoppingCart />
                Shop Now
              </Link>
            </motion.button>

            <motion.button
              className="border border-[#03793d] text-[#03793d] px-6 py-3 rounded shadow-md hover:bg-[#03793d] hover:text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/#contact" className="flex items-center gap-3">
                <FiPhoneForwarded />
                Contact Us
              </Link>
            </motion.button>
          </div>
        </div>

        {/* Imágenes con transición suave */}
        <div className="relative w-[500px] h-[500px] flex justify-center items-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            {banners.map((banner, index) => (
              index === currentBanner && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 2 , ease: "easeInOut" }}
                  className="absolute"
                >
                  <Image
                    src={banner}
                    alt="Surgical Supplies"
                    width={500}
                    height={500}
                    priority
                    className="rounded-lg shadow-lg"
                  />
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Banner;
