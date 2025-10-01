import React, { useState, useEffect } from "react";
import Image from "next/image";
import Banner1 from "../public/images/assets/banner1.jpg";
import Banner2 from "../public/images/assets/banner2.svg";
import Banner3 from "../public/images/assets/banner3.webp";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiPhoneForwarded } from "react-icons/fi";
import { TiShoppingCart } from "react-icons/ti";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

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
    <motion.div
      className='text-title-color-dark text-center'
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className='grid lg:grid-cols-2 md:grid-cols-1 banner-container mx-auto px-4 items-center'>
        {/* Texto */}
        <motion.div className='text-left -mt-6' variants={containerVariants}>
          <h1 className='text-4xl font-bold mb-6 text-center text-[#0e355e]'>
            Welcome to STAT Surgical Supply
          </h1>

          <p className='text-[#414b53de] text-base font-normal text-center mb-6'>
            Your Trusted Source for Surgical Supplies. Trusted by more than 150+
            healthcare facilities. High-quality at unmatched prices. Explore our
            wide range of premium surgical disposables, implants, and
            instruments. We offer industry-leading brands with cost-saving
            solutions tailored to your healthcare needs.
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
        </motion.div>

        <motion.div
          className='relative w-full max-w-[500px] aspect-[1/1] mx-auto'
          variants={imageVariants}
        >
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Banner;
