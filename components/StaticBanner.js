import Link from 'next/link';
import React from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import { motion } from 'framer-motion';

const StaticBanner = () => {
  return (
    <motion.div 
      className="static-banner-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <div className="banner-content">
        <h2 className="banner-title text-[#144e8b] text-3xl font-bold mb-4">
          Partner With Us and Sell Your Surgical Disposables
        </h2>
        <p className="banner-description text-lg text-gray-700 mb-6">
          Stat Surgical Supply is looking to fill our customer demand. We pay
          top dollar for in-date high-end surgical disposables.
        </p>
          <Link className="flex justify-center items-center gap-2 bg-[#03793d] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#144e8b] transition duration-300" href="/ManufacturerForm">
            <span className="font-semibold">Send us your list</span>
            <AiOutlineSend className="text-xl" />
          </Link>
      </div>
    </motion.div>
  );
};

export default StaticBanner;