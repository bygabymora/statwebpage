"use client";

import React from "react";
import {
  FaQuestionCircle,
  FaClock,
  FaShieldAlt,
  FaAward,
} from "react-icons/fa";
import { BsGeoAlt, BsClock, BsEnvelope, BsTelephone } from "react-icons/bs";
import Link from "next/link";

export default function ContactMethodsGrid() {
  return (
    <section className='mb-16'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>Get In Touch</h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Choose the most convenient way to reach our support team
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Phone Support */}
        <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#144e8b] to-[#0e355e] rounded-full mb-4 group-hover:scale-110 transition-transform'>
              <BsTelephone className='text-2xl text-white' />
            </div>
            <h3 className='font-bold text-[#144e8b] text-lg mb-2'>
              Phone Support
            </h3>
            <p className='text-gray-600 text-sm mb-3'>
              Immediate assistance available
            </p>
            <a
              href='tel:+18132520727'
              className='text-[#144e8b] font-semibold hover:text-[#0e355e] transition-colors'
              title='Call Support'
            >
              +1 (813) 252-0727
            </a>
            <div className='flex items-center justify-center mt-2 text-xs text-gray-500'>
              <FaClock className='mr-1' />
              Mon-Fri 8AM-5PM EST
            </div>
          </div>
        </div>

        {/* Email Support */}
        <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#07783e] to-[#065a2f] rounded-full mb-4 group-hover:scale-110 transition-transform'>
              <BsEnvelope className='text-2xl text-white' />
            </div>
            <h3 className='font-bold text-[#144e8b] text-lg mb-2'>
              Email Support
            </h3>
            <p className='text-gray-600 text-sm mb-3'>
              Detailed inquiries welcome
            </p>
            <a
              href='mailto:centralsales@statsurgicalsupply.com?subject=Support%20Request&body=Hello,%20I%20need%20help%20with...'
              className='text-[#144e8b] font-semibold hover:text-[#0e355e] transition-colors text-sm'
              title='Email Support'
            >
              centralsales@statsurgicalsupply.com
            </a>
            <div className='flex items-center justify-center mt-2 text-xs text-gray-500'>
              <FaClock className='mr-1' />
              24hr response time
            </div>
          </div>
        </div>

        {/* Visit Us */}
        <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#dc3545] to-[#b02a37] rounded-full mb-4 group-hover:scale-110 transition-transform'>
              <BsGeoAlt className='text-2xl text-white' />
            </div>
            <h3 className='font-bold text-[#144e8b] text-lg mb-2'>
              Visit Our Office
            </h3>
            <p className='text-gray-600 text-sm mb-3'>
              Face-to-face consultation
            </p>
            <address className='text-[#144e8b] font-semibold not-italic text-sm'>
              100 Ashley Dr S #600
              <br />
              Tampa, FL 33602
            </address>
            <div className='flex items-center justify-center mt-2 text-xs text-gray-500'>
              <BsClock className='mr-1' />
              By appointment
            </div>
          </div>
        </div>

        {/* 24/7 Resources */}
        <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffc107] to-[#e0a800] rounded-full mb-4 group-hover:scale-110 transition-transform'>
              <FaQuestionCircle className='text-2xl text-white' />
            </div>
            <h3 className='font-bold text-[#144e8b] text-lg mb-2'>
              Self-Service
            </h3>
            <p className='text-gray-600 text-sm mb-3'>
              24/7 available resources
            </p>
            <div className='space-y-1'>
              <Link
                href='/faqs'
                className='block text-[#144e8b] hover:text-[#0e355e] transition-colors text-sm'
              >
                FAQs
              </Link>
              <Link
                href='/order-history'
                className='block text-[#144e8b] hover:text-[#0e355e] transition-colors text-sm'
              >
                Order Tracking
              </Link>
            </div>
            <div className='flex items-center justify-center mt-2 text-xs text-gray-500'>
              <FaClock className='mr-1' />
              Always available
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Our Support */}
      <div className='mt-16 bg-gray-50 rounded-xl p-8'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
            Why Choose Our Support?
          </h2>
          <p className='text-lg text-gray-600'>
            Professional expertise you can trust
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-[#144e8b] rounded-full mb-4'>
              <FaShieldAlt className='text-2xl text-white' />
            </div>
            <h3 className='font-bold text-[#144e8b] text-lg mb-2'>
              Trusted Expertise
            </h3>
            <p className='text-gray-600'>
              Over 15 years of experience in surgical supply distribution and
              customer service.
            </p>
          </div>

          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-[#07783e] rounded-full mb-4'>
              <FaAward className='text-2xl text-white' />
            </div>
            <h3 className='font-bold text-[#144e8b] text-lg mb-2'>
              Quality Assurance
            </h3>
            <p className='text-gray-600'>
              Every inquiry is handled with the utmost care and professional
              attention to detail.
            </p>
          </div>

          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-[#dc3545] rounded-full mb-4'>
              <FaClock className='text-2xl text-white' />
            </div>
            <h3 className='font-bold text-[#144e8b] text-lg mb-2'>
              Fast Response
            </h3>
            <p className='text-gray-600'>
              Quick turnaround times to keep your surgical facility running
              smoothly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
