import Link from "next/link";
import React from "react";
import { AiOutlineSend } from "react-icons/ai";
import { motion } from "framer-motion";
import Image from "next/image";

const StaticBanner = () => {
  return (
    <motion.div
      className='static-banner-container text-white py-10 px-6 rounded-lg shadow-lg my-12'
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div className='banner-content text-center md:text-left md:flex md:items-center md:justify-between gap-10'>
        <div className='hidden md:block md:w-1/3'>
          <Image
            width={500}
            height={500}
            title='Healthcare Promotion Banner'
            src='/images/assets/StaticBanner.png'
            alt='Seasonal Discounts on Healthcare Products'
            loading={"lazy"}
            className='rounded-lg shadow-lg'
          />
        </div>

        <div className='flex-1'>
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='text-[#0e355e] text-3xl md:text-4xl font-bold mb-4'
          >
            Sell Your Surgical Disposables - Partner with Us
          </motion.h2>

          <h2 className='text-base text-[#414b53] mb-6 max-w-base font-normal'>
            STAT Surgical Supply is actively sourcing high-end, in-date surgical
            disposables and implants. We offer competitive payouts to meet
            growing customer demand.
          </h2>

          <ul className='text-lg text-[#414b53] mb-6 space-y-2'>
            {[
              "We pay top dollar for unused and in-date surgical disposables and implants",
              "Fast and secure transaction process.",
              "Contribute to reducing medical waste.",
            ].map((item, index) => (
              <li key={index} className='flex items-center'>
                <AiOutlineSend className='mr-2 text-[#0e355e] shrink-0' />{" "}
                {item}
              </li>
            ))}
          </ul>
          <div className='md:w-auto'>
            <Link
              href='/ManufacturerForm'
              title='Submit Your Manufacturer Product List - Medical Supplies'
              className='flex w-fit items-center gap-3 bg-[#0e355e] text-white px-10 py-2 rounded-full shadow-lg hover:bg-[#788b9b] hover:scale-105 transition duration-300 transform'
            >
              <span className='font-semibold'>Send us your list</span>
              <AiOutlineSend className='text-2xl' />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StaticBanner;
