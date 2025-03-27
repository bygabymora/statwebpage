import React from 'react';
import { FaDollarSign, FaTags, FaHandshake, FaChartLine } from 'react-icons/fa';
import Layout from '../components/main/Layout';

export default function GuaranteedSavings({ isInClearance }) {
  return (
    <Layout>
    <section className="w-full bg-white my-10 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-[#144e8b] leading-tight">
          Guaranteed Savings, Tailored for You
        </h2>
        <p className="text-lg text-[#414b53] mt-4 max-w-3xl mx-auto">
          Get the best deals on high-quality medical supplies. Flexible pricing and exclusive discounts await you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105">
            <FaDollarSign className="text-5xl text-[#03793d] animate-pulse" />
            <h4 className="text-xl font-bold text-[#144e8b] mt-4">Best Prices</h4>
            <p className="text-[#414b53] text-sm mt-2">Save up to X% on selected products.</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105">
            <FaHandshake className="text-5xl text-[#03793d]" />
            <h4 className="text-xl font-bold text-[#144e8b] mt-4">Negotiable Discounts</h4>
            <p className="text-[#414b53] text-sm mt-2">Exclusive pricing, just for you.</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105">
            <FaChartLine className="text-5xl text-[#03793d]" />
            <h4 className="text-xl font-bold text-[#144e8b] mt-4">Cost Optimization</h4>
            <p className="text-[#414b53] text-sm mt-2">Lower your expenses effortlessly.</p>
          </div>
        </div>

        {isInClearance && (
          <div className="mt-12 p-8 bg-[#e8f5e9] border-2 border-[#03793d] rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105">
            <FaTags className="text-5xl text-[#03793d]" />
            <h4 className="text-xl font-bold text-[#144e8b] mt-4">Limited-Time Clearance</h4>
            <p className="text-[#414b53] text-sm mt-2">
              Special discounted items available for a short time. Grab them before they're gone!
            </p>
            <a
              href="/clearance"
              className="mt-4 px-6 py-2 bg-[#03793d] text-white font-bold rounded-lg shadow-md hover:bg-[#025e2d] transition-all duration-300"
            >
              View Deals
            </a>
          </div>
        )}

        <div className="mt-10">
          <button href="/products"
            className="px-8 py-3 bg-[#03793d] text-white text-lg font-bold rounded-lg shadow-lg hover:bg-[#025e2d] transition-all duration-300 transform hover:scale-105"
          >
            Start Saving Now
          </button>
        </div>
      </div>
    </section>
    </Layout>
  );
}