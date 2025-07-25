import React from "react";
import { FaDollarSign, FaTags, FaHandshake, FaChartLine } from "react-icons/fa";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";

export default function GuaranteedSavings({ isInClearance }) {
  const breadcrumbs = [
    { href: "/", name: "Home" },
    { name: "Guaranteed Savings" },
  ];

  return (
    <Layout title={"Guaranteed Savings"}>
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2 my-5'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#0e355e]'
                >
                  {breadcrumb.name}
                </Link>
              ) : (
                <span>{breadcrumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <section className='w-full bg-white my-10 px-6'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-4xl font-bold text-[#0e355e] leading-tight'>
            Guaranteed Savings, Tailored for You
          </h2>
          <p className='text-lg text-[#414b53] mt-4 max-w-3xl mx-auto'>
            Get the best deals on high-quality medical supplies. Flexible
            pricing and exclusive discounts await you.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12'>
            <div className='p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105'>
              <FaDollarSign className='text-5xl text-[#07783e] animate-pulse' />
              <h4 className='text-xl font-bold text-[#0e355e] mt-4'>
                Best Prices
              </h4>
              <p className='text-[#414b53] text-sm mt-2'>
                Save up to 50% on selected products.
              </p>
            </div>

            <div className='p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105'>
              <FaHandshake className='text-5xl text-[#07783e]' />
              <h4 className='text-xl font-bold text-[#0e355e] mt-4'>
                Negotiable Discounts
              </h4>
              <p className='text-[#414b53] text-sm mt-2'>
                Exclusive pricing, just for you.
              </p>
            </div>

            <div className='p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105'>
              <FaChartLine className='text-5xl text-[#07783e]' />
              <h4 className='text-xl font-bold text-[#0e355e] mt-4'>
                Cost Optimization
              </h4>
              <p className='text-[#414b53] text-sm mt-2'>
                Lower your expenses effortlessly.
              </p>
            </div>
          </div>

          {isInClearance && (
            <div className='mt-12 p-8 bg-[#e8f5e9] border-2 border-[#07783e] rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105'>
              <FaTags className='text-5xl text-[#07783e]' />
              <h4 className='text-xl font-bold text-[#0e355e] mt-4'>
                Limited-Time Clearance
              </h4>
              <p className='text-[#414b53] text-sm mt-2'>
                Special discounted items available for a short time. Grab them
                before they re gone!
              </p>
              <Link
                href='/clearance'
                className='mt-4 px-6 py-2 bg-[#07783e] text-white font-bold rounded-lg shadow-md hover:bg-[#065f2d] transition-all duration-300'
              >
                View Deals
              </Link>
            </div>
          )}

          <div className='mt-10'>
            <button
              onClick={() => {
                window.location.href = "/products";
              }}
              className='px-8 py-3 bg-[#07783e] text-white text-lg font-bold rounded-lg shadow-lg hover:bg-[#025e2d] transition-all duration-300 transform hover:scale-105'
            >
              Start Saving Now
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
