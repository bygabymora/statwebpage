// pages/guaranteed-savings.js

import React, { useState } from "react";
import {
  FaDollarSign,
  FaTags,
  FaHandshake,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { HiSparkles, HiTrendingUp, HiClipboardCheck } from "react-icons/hi";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";

export default function GuaranteedSavings({ isInClearance }) {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const breadcrumbs = [
    { href: "/", name: "Home" },
    { name: "Guaranteed Savings" },
  ];

  const faqData = [
    {
      question: "Are products new and OEM-grade?",
      answer:
        "Yes. STAT only works with unused, factory-sealed OEM products sourced from verified U.S. healthcare facilities and trusted channels. No gray-market, refurbished, or reprocessed items.",
    },
    {
      question: "Can we use STAT alongside our primary distributor?",
      answer:
        "Absolutely. Most clients use STAT as a secondary and contingency supplier for backorders, discontinued SKUs, non-contract items, and cost optimization projects.",
    },
    {
      question: "How do you document savings?",
      answer:
        "We can provide item-level comparisons versus current pricing, including contract vs. STAT pricing, to help your team track and report realized savings over time.",
    },
    {
      question: "What is the minimum order size?",
      answer:
        "We support a wide range of order sizes—from case-based urgent needs to larger optimization projects—so your team can start small and scale as value is proven.",
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Guaranteed Savings on Surgical Supplies",
    description:
      "Save up to 50% on surgical supplies through STAT Surgical Supply's cost-resilience program for hospitals and surgery centers.",
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: faqData.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    provider: {
      "@type": "Organization",
      name: "STAT Surgical Supply",
      description: "Cost-resilience partner for hospitals and surgery centers",
    },
  };

  return (
    <Layout
      title='Guaranteed Savings | STAT Surgical Supply'
      description='STAT Surgical Supply helps hospitals and surgery centers save up to 50% on surgical supplies through out-of-contract procurement, discontinued OEM SKUs, and urgent backup coverage when primary distributors cannot fulfill orders.'
      schema={[schemaData]}
    >
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2 -mt-5'>
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

      <main className='w-full'>
        <section className='text-black py-16 px-6 relative overflow-hidden'>
          <div className='absolute inset-0 text-black'></div>
          <div className='max-w-6xl mx-auto relative z-10'>
            <header className='text-center'>
              <div className='inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-6'>
                <HiSparkles className='text-[#07783e] mr-2' />
                <span className='text-sm font-semibold'>
                  Guaranteed Savings Program
                </span>
              </div>
              <h1 className='text-5xl lg:text-6xl font-bold leading-tight mb-6'>
                Save Up To{" "}
                <span className='text-[#07783e] animate-pulse'>50%</span> on
                <br />
                Surgical Supplies
              </h1>
              <p className='text-xl text-black mt-6 max-w-4xl mx-auto font-light leading-relaxed'>
                STAT Surgical Supply acts as your{" "}
                <strong className='text-[#0e355e]'>
                  cost-resilience partner
                </strong>{" "}
                for hospitals, surgery centers, and healthcare providers. Access
                discontinued OEM SKUs, out-of-contract purchasing, and urgent
                backup coverage when primary distributors cannot deliver.
              </p>

              {/* Statistics */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-8'>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#0e355e]'>50%</div>
                  <div className='text-sm text-black mt-1'>Maximum Savings</div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#0e355e]'>24/7</div>
                  <div className='text-sm text-black mt-1'>Urgent Coverage</div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#0e355e]'>OEM</div>
                  <div className='text-sm text-black mt-1'>Grade Quality</div>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 justify-center mt-8'>
                <button
                  onClick={() => (window.location.href = "/products")}
                  className='px-8 py-4 bg-[#07783e] text-white text-lg font-bold rounded-lg shadow-xl hover:bg-[#025e2d] transition-all duration-300 transform hover:scale-105 flex items-center justify-center'
                >
                  <FaDollarSign className='mr-2' />
                  Start Saving Now
                </button>
                <Link
                  href='/#contact'
                  className='px-8 py-4 border-2 border-[#0e355e] text-[#0e355e] text-lg font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center'
                >
                  <HiClipboardCheck className='mr-2' />
                  Request Savings Review
                </Link>
              </div>
            </header>
          </div>
        </section>

        {/* Main Content */}
        <section className='bg-white py-16 px-6'>
          <div className='max-w-6xl mx-auto'>
            {/* Key Benefits Section */}
            <h2 className='text-3xl font-bold text-[#0e355e] text-center mb-12'>
              Why Healthcare Leaders Choose Our Savings Program
            </h2>

            <section className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16'>
              <article className='group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 transform transition duration-300 hover:scale-105 hover:shadow-2xl'>
                <div className='bg-gradient-to-r from-[#07783e] to-[#0a9447] w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300'>
                  <FaDollarSign className='text-3xl text-white' />
                </div>
                <h3 className='text-xl font-bold text-[#0e355e] mb-4'>
                  Best Prices on Critical SKUs
                </h3>
                <p className='text-[#414b53] text-sm leading-relaxed mb-4'>
                  Capture savings of up to{" "}
                  <strong className='text-[#07783e]'>
                    50% on selected products
                  </strong>{" "}
                  without compromising quality. Ideal for volume procedures,
                  high consumption lines, and non-contract items that strain
                  your budget.
                </p>
                <div className='flex items-center text-xs text-[#07783e] font-semibold'>
                  <FaCheckCircle className='mr-2' />
                  Verified OEM Quality
                </div>
              </article>

              <article className='group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 transform transition duration-300 hover:scale-105 hover:shadow-2xl'>
                <div className='bg-gradient-to-r from-[#0e355e] to-[#1a4971] w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300'>
                  <FaHandshake className='text-3xl text-white' />
                </div>
                <h3 className='text-xl font-bold text-[#0e355e] mb-4'>
                  Negotiated & Flexible Discounts
                </h3>
                <p className='text-[#414b53] text-sm leading-relaxed mb-4'>
                  Work directly with our team to structure{" "}
                  <strong className='text-[#07783e]'>
                    tiered discounts, spot buys, and project-based pricing
                  </strong>{" "}
                  that align with your budget cycles, case mix, and capital
                  planning.
                </p>
                <div className='flex items-center text-xs text-[#07783e] font-semibold'>
                  <FaClock className='mr-2' />
                  Fast Turnaround
                </div>
              </article>

              <article className='group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 transform transition duration-300 hover:scale-105 hover:shadow-2xl'>
                <div className='bg-gradient-to-r from-[#07783e] to-[#0e355e] w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300'>
                  <FaShieldAlt className='text-3xl text-white' />
                </div>
                <h3 className='text-xl font-bold text-[#0e355e] mb-4'>
                  Cost Optimization, Not Just Cheap
                </h3>
                <p className='text-[#414b53] text-sm leading-relaxed mb-4'>
                  We focus on{" "}
                  <strong className='text-[#07783e]'>
                    OEM-grade, unused, U.S.-sourced inventory
                  </strong>{" "}
                  with strong dating and sealed OEM packaging, supporting supply
                  chain resilience instead of one-time opportunistic deals.
                </p>
                <div className='flex items-center text-xs text-[#07783e] font-semibold'>
                  <HiTrendingUp className='mr-2' />
                  Supply Chain Resilience
                </div>
              </article>
            </section>

            <section className='mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10'>
              <article className='bg-[#f4f7fb] rounded-xl p-8 shadow'>
                <h2 className='text-2xl font-bold text-[#0e355e] mb-3'>
                  When Guaranteed Savings Makes the Biggest Impact
                </h2>
                <p className='text-[#414b53] text-sm mb-4'>
                  Our savings program is designed to complement—not replace—your
                  primary distributor. STAT steps in when internal teams need
                  flexibility, speed, or access beyond standard contracts:
                </p>
                <ul className='list-disc list-inside text-sm text-[#414b53] space-y-2'>
                  <li>Out-of-contract hospital or ASC purchasing</li>
                  <li>Discontinued, constrained, or hard-to-source OEM SKUs</li>
                  <li>
                    Backorders and supply interruptions that put cases or
                    surgeons at risk
                  </li>
                  <li>
                    Cost-reduction initiatives that require measurable savings
                    without sacrificing OEM quality
                  </li>
                  <li>
                    Short-term projects, expansions, or temporary volume spikes
                  </li>
                </ul>
              </article>

              <article className='bg-white rounded-xl p-8 shadow border border-[#e0e7ef]'>
                <h2 className='text-2xl font-bold text-[#0e355e] mb-3'>
                  How the Savings Model Works
                </h2>
                <p className='text-[#414b53] text-sm mb-4'>
                  Every order follows a verified, traceable process to protect
                  your clinicians and patients:
                </p>
                <ol className='list-decimal list-inside text-sm text-[#414b53] space-y-2'>
                  <li>
                    You share target items, SKUs, or clinical categories that
                    are driving cost pressure.
                  </li>
                  <li>
                    Our team sources{" "}
                    <strong>unused, sealed OEM inventory</strong> from vetted
                    U.S. healthcare facilities and approved channels.
                  </li>
                  <li>
                    We present <strong>side-by-side pricing and dating</strong>{" "}
                    so your supply chain team can validate savings and quality.
                  </li>
                  <li>
                    Orders ship quickly from our warehouse with{" "}
                    <strong>clear documentation and traceability</strong>.
                  </li>
                </ol>
              </article>
            </section>

            {isInClearance && (
              <section className='mt-12'>
                <div className='p-8 bg-[#e8f5e9] border-2 border-[#07783e] rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105'>
                  <FaTags className='text-5xl text-[#07783e]' />
                  <h2 className='text-xl font-bold text-[#0e355e] mt-4'>
                    Limited-Time Clearance Opportunities
                  </h2>
                  <p className='text-[#414b53] text-sm mt-2 text-center max-w-2xl'>
                    Selected lots and SKUs may qualify for{" "}
                    <strong>additional clearance discounts</strong> when dating,
                    packaging format, or remaining quantities align with your
                    clinical needs. These items move quickly and are available
                    for a short time only.
                  </p>
                  <Link
                    href='/clearance'
                    className='mt-4 px-6 py-2 bg-[#07783e] text-white font-bold rounded-lg shadow-md hover:bg-[#065f2d] transition-all duration-300'
                  >
                    View Current Deals
                  </Link>
                </div>
              </section>
            )}

            {/* FAQ Section */}
            <section className='mt-16'>
              <div className='text-center mb-12'>
                <h2 className='text-3xl font-bold text-[#0e355e] mb-4'>
                  Frequently Asked Questions About Savings
                </h2>
                <p className='text-[#414b53] max-w-2xl mx-auto'>
                  Get answers to common questions about our guaranteed savings
                  program and how it works for healthcare facilities.
                </p>
              </div>

              <div className='max-w-4xl mx-auto space-y-4'>
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className='w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200'
                      aria-expanded={expandedFAQ === index}
                    >
                      <h3 className='font-semibold text-[#0e355e] text-lg pr-4'>
                        {faq.question}
                      </h3>
                      {expandedFAQ === index ? (
                        <FaChevronUp className='text-[#07783e] flex-shrink-0' />
                      ) : (
                        <FaChevronDown className='text-[#07783e] flex-shrink-0' />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className='px-6 pb-4 text-[#414b53] leading-relaxed border-t border-gray-100 pt-4 mt-2'>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: faq.answer.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-[#07783e]">$1</strong>'
                            ),
                          }}
                        ></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Final Call to Action */}
            <section className='mt-16 rounded-2xl p-12 text-center text-white relative overflow-hidden'>
              <div className='absolute inset-0 bg-gray-100'></div>
              <div className='relative z-10'>
                <h2 className='text-3xl font-bold mb-4'>
                  Ready to Start Saving on Surgical Supplies?
                </h2>
                <p className='text-xl text-gray-700 mb-8 max-w-3xl mx-auto'>
                  Join hundreds of healthcare facilities already saving with
                  STAT Surgical Supply guaranteed savings program.
                </p>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                  <button
                    onClick={() => (window.location.href = "/products")}
                    className='px-8 py-4 bg-white text-[#0e355e] text-lg font-bold rounded-lg shadow-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center'
                  >
                    <FaDollarSign className='mr-2' />
                    Shop Surgical Supplies
                  </button>
                  <Link
                    href='/#contact'
                    className='px-8 py-4 border-2 border-[#07783e] text-[#07783e] text-lg font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center'
                  >
                    <HiClipboardCheck className='mr-2' />
                    Request Savings Review
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </Layout>
  );
}
