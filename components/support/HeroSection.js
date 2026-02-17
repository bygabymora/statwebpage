// Critical hero content - Server Component (no icons to reduce bundle size)
import React from "react";
import { FaEnvelope, FaHeadset, FaPhone } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section className='bg-gray-100 text-gray-900 py-16 px-6 mb-12 rounded-xl mx-4 lg:mx-20 my-5'>
      <div className='max-w-4xl mx-auto text-center'>
        {/* Simple placeholder for icon - will be enhanced by client component */}
        <div className='inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6'>
          <FaHeadset className='text-4xl text-[#0e355e]' />
        </div>
        <h1 className='text-4xl lg:text-5xl font-bold mb-4'>
          Professional Customer Support
        </h1>
        <h2 className='text-xl lg:text-2xl font-light mb-6 text-[#0e355e]'>
          Expert assistance for surgical professionals
        </h2>
        {/* LCP Element - Critical paragraph */}
        <p className='text-lg leading-relaxed max-w-3xl mx-auto text-[#0e355e]'>
          Need assistance with your surgical supply order or product questions?
          Our dedicated support team is here to help surgical professionals like
          you with personalized service and expert guidance.
        </p>
        {/* Simple CTA without icons initially */}
        <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
          <a
            href='tel:+18132520727'
            className='inline-flex items-center px-8 py-3 bg-white text-[#144e8b] font-semibold rounded-lg hover:bg-blue-100 transition-colors shadow-lg'
          >
            <FaPhone className='mr-2' />
            Call Now: (813) 252-0727
          </a>
          <a
            href='mailto:centralsales@statsurgicalsupply.com'
            className='inline-flex items-center px-8 py-3 bg-transparent border-2 border-[#144e8b] text-[#144e8b]
               font-semibold rounded-lg hover:bg-white hover:text-[#144e8b] transition-all'
          >
            <FaEnvelope className='mr-2' />
            Send Email
          </a>
        </div>
      </div>
    </section>
  );
}
