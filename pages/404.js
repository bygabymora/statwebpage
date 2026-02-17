import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "../components/main/Layout";
import Lottie from "lottie-react";
import animationData from "../public/404-Ilustration.json";
import { BiHome, BiSearch, BiPhone } from "react-icons/bi";
import { FaStethoscope } from "react-icons/fa";

export default function Custom404() {
  return (
    <Layout
      title='Page Not Found'
      description="The page you're looking for doesn't exist. Explore our surgical supplies or contact our team for assistance."
    >
      <div className='min-h-[70vh] w-full flex flex-col items-center justify-center py-12'>
        {/* Main Content Container */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center max-w-2xl mx-auto px-6'
        >
          {/* 404 Title with Brand Colors */}
          <div className='mb-8 -mt-14'>
            <h1 className='text-6xl md:text-8xl font-bold text-[#0e355e] mb-4'>
              404
            </h1>
            <div className='w-24 h-1 bg-gradient-to-r from-[#0e355e] to-[#67b7dc] mx-auto mb-6'></div>
          </div>

          {/* Lottie Animation */}
          <div className='flex justify-center mb-8 -mt-28'>
            <Lottie
              animationData={animationData}
              loop={true}
              style={{
                width: 280,
                height: 280,
              }}
            />
          </div>

          {/* Error Message */}
          <div className='mb-8 -mt-32'>
            <h2 className='text-2xl md:text-3xl font-bold text-[#0e355e] mb-4'>
              Oops! Page Not Found
            </h2>
            <p className='text-lg text-gray-600 leading-relaxed mb-2'>
              The page you&apos;re looking for might have been moved, deleted,
              or doesn&apos;t exist.
            </p>
            <p className='text-base text-gray-500'>
              Let&apos;s get you back to finding the surgical supplies you need.
            </p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'
          >
            <Link
              href='/'
              className='flex items-center gap-2 px-8 py-3 bg-[#0e355e] text-white rounded-full font-semibold hover:bg-[#0e3260] transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <BiHome size={20} />
              Back to Home
            </Link>
            <Link
              href='/products'
              className='flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#0e355e] text-[#0e355e] rounded-full font-semibold hover:bg-[#0e355e] hover:text-white transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <FaStethoscope size={18} />
              View Products
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className='border-t border-gray-200 pt-8'
          >
            <h3 className='text-lg font-semibold text-[#0e355e] mb-4'>
              Popular Pages
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <Link
                href='/search'
                className='flex items-center gap-2 text-gray-600 hover:text-[#0e355e] transition'
              >
                <BiSearch size={16} />
                Search Products
              </Link>
              <Link
                href='/about'
                className='text-gray-600 hover:text-[#0e355e] transition'
              >
                About Us
              </Link>
              <Link
                href='/support'
                className='flex items-center gap-2 text-gray-600 hover:text-[#0e355e] transition'
              >
                <BiPhone size={16} />
                Support
              </Link>
              <Link
                href='/news'
                className='text-gray-600 hover:text-[#0e355e] transition'
              >
                Health News
              </Link>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className='mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200'
          >
            <h4 className='text-base font-semibold text-[#0e355e] mb-2'>
              Need Help Finding Something?
            </h4>
            <p className='text-sm text-gray-600 mb-3'>
              Our team is here to help you find the right surgical supplies.
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center text-sm'>
              <a
                href='mailto:sales@statsurgicalsupply.com'
                className='text-[#0e355e] hover:underline font-medium'
              >
                sales@statsurgicalsupply.com
              </a>
              <span className='hidden sm:block text-gray-400'>|</span>
              <span className='text-gray-600'>
                Trusted by 150+ healthcare facilities
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
