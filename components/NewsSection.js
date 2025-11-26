import React from "react";
import Link from "next/link";
import { NewsItem } from "./NewsItem";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const NewsSection = ({ news = [] }) => {
  if (!news || news.length === 0) {
    return null; // Don't render if no news available
  }

  return (
    <motion.section
      variants={containerVariants}
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.2 }}
      aria-labelledby='news-section-heading'
      role='region'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.header className='text-center mb-10' variants={itemVariants}>
          <h2
            id='news-section-heading'
            className='text-3xl font-bold text-[#0e355e] mb-4'
          >
            Latest Healthcare News & Insights
          </h2>
          <p className='text-[#414b53de] text-base font-normal max-w-3xl mx-auto'>
            Stay informed with the latest developments in healthcare, surgical
            innovations, and medical supply industry trends that impact your
            practice.
          </p>
        </motion.header>

        <motion.div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
          variants={containerVariants}
        >
          {news.slice(0, 3).map((item) => (
            <motion.div key={item.slug} variants={itemVariants}>
              <NewsItem news={item} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div className='text-center' variants={itemVariants}>
          <Link
            href='/news'
            className='inline-flex items-center px-6 text-[#0e355e] font-medium hover:text-[#03793d] transition-colors duration-200'
            aria-label='View all healthcare news and industry insights'
            title='Explore more healthcare news and surgical supply updates'
          >
            View All News & Insights
            <svg
              className='ml-2 w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default NewsSection;
