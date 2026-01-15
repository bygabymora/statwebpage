import React from "react";
import Layout from "../components/main/Layout";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";
import dynamic from "next/dynamic";
import HeroSection from "../components/support/HeroSection";

// Dynamic imports for non-critical components
const HeroEnhancements = dynamic(
  () => import("../components/support/HeroEnhancements"),
  {
    ssr: false,
  }
);

const ContactMethodsGrid = dynamic(
  () => import("../components/support/ContactMethodsGrid"),
  {
    loading: () => (
      <div className='mb-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
            Get In Touch
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Choose the most convenient way to reach our support team
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse'
            >
              <div className='text-center'>
                <div className='w-16 h-16 bg-gray-200 rounded-full mb-4 mx-auto'></div>
                <div className='h-4 bg-gray-200 rounded mb-2'></div>
                <div className='h-3 bg-gray-200 rounded mb-3'></div>
                <div className='h-3 bg-gray-200 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

const LocationMap = dynamic(() => import("../components/support/LocationMap"), {
  loading: () => (
    <div className='mb-16'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
          Find Our Location
        </h2>
        <p className='text-lg text-gray-600'>
          Located in the heart of Tampa, Florida
        </p>
      </div>
      <div className='rounded-2xl overflow-hidden shadow-2xl border-4 border-[#144e8b] h-96 lg:h-[500px] bg-gray-100 flex items-center justify-center'>
        <div className='text-gray-500'>Loading map...</div>
      </div>
    </div>
  ),
});

const FaqSection = dynamic(() => import("../components/FaqSection"), {
  loading: () => (
    <div className='mb-16'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
          Frequently Asked Questions
        </h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Quick answers to common questions about our medical supply services
        </p>
      </div>
      <div className='max-w-4xl mx-auto space-y-4'>
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className='bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse'
          >
            <div className='h-4 bg-gray-200 rounded mb-2'></div>
            <div className='h-3 bg-gray-200 rounded w-3/4'></div>
          </div>
        ))}
      </div>
    </div>
  ),
});

export default function Support() {
  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "Support" }];

  return (
    <Layout
      title='Customer Support | STAT Surgical Supply'
      description='Get in touch with STAT Surgical Supply customer support for assistance with surgical and medical supplies. Contact us via phone, email, or visit our location for expert help and answers to your questions.'
      schema={[]}
    >
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#144e8b] hover:text-[#0e355e] transition-colors'
                >
                  {breadcrumb.name}
                </Link>
              ) : (
                <span className='text-[#144e8b] font-medium'>
                  {breadcrumb.name}
                </span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Critical Hero Section - Server Rendered */}
      <HeroSection />

      {/* Non-critical enhancements loaded after LCP */}
      <HeroEnhancements />

      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        {/* Contact Methods Grid - Dynamically loaded */}
        <ContactMethodsGrid />

        {/* Interactive Map - Dynamically loaded */}
        <LocationMap />

        {/* Interactive FAQ Section - Dynamically loaded */}
        <FaqSection />
      </div>
    </Layout>
  );
}
