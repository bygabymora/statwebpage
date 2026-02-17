import Link from "next/link";
import React from "react";
import { AiOutlineSend, AiOutlineArrowRight } from "react-icons/ai";
import { motion } from "framer-motion";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3, duration: 0.8, ease: "easeOut" },
  }),
};

const StaticBanner = () => {
  return (
    <motion.div
      className='static-banner-container text-white py-12 px-6 rounded-2xl shadow-xl my-16 bg-white'
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className='banner-content text-center md:text-left md:flex md:items-center md:justify-between gap-10'>
        <motion.div
          className='hidden md:block md:w-1/3'
          variants={fadeInUp}
          custom={0}
        >
          <Image
            width={500}
            height={500}
            title='Quality Surgical Solutions'
            src='/images/assets/StaticBanner.png'
            alt='Seasonal Discounts on Healthcare Products'
            loading='lazy'
            className='rounded-xl shadow-lg'
          />
        </motion.div>

        <div className='flex-1'>
          <motion.h2
            variants={fadeInUp}
            custom={1}
            className='text-[#0e355e] text-3xl md:text-4xl font-bold mb-4'
          >
            Sell Your Surgical Disposables - Partner with Us
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            custom={2}
            className='text-base text-[#414b53] mb-6 max-w-lg font-normal'
          >
            STAT Surgical Supply is actively sourcing high-end, in-date surgical
            disposables and implants. We offer competitive payouts to meet
            growing customer demand. Join the 150+ health care centers who
            already partner with us.
          </motion.p>

          <motion.ul
            variants={fadeInUp}
            custom={3}
            className='text-lg text-[#414b53] mb-6 space-y-3'
          >
            {[
              "We pay top dollar for unused and in-date surgical disposables and implants",
              "Fast and secure transaction process.",
              "Contribute to reducing surgical supplies waste.",
            ].map((item, index) => (
              <li key={index} className='flex items-center'>
                <AiOutlineSend className='mr-2 text-[#0e355e] shrink-0' />
                {item}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={fadeInUp} custom={4} className='md:w-auto'>
            <Link
              href='/ManufacturerForm'
              title='Submit Your Manufacturer Product List - sterile surgery'
              className='flex w-fit items-center gap-3 bg-[#0e355e] px-10 py-3 rounded-full backdrop-blur-md bg-white/30 text-[#0e355e] font-semibold shadow-lg transition-all duration-300 hover:scale-105'
            >
              <span>Send us your list</span>
              <AiOutlineArrowRight className='w-5 h-5' />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StaticBanner;
