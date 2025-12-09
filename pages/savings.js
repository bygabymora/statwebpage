// pages/guaranteed-savings.js

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
    <Layout
      title='Guaranteed Savings | STAT Surgical Supply'
      description='STAT Surgical Supply helps hospitals and surgery centers save up to 50% on surgical supplies through out-of-contract procurement, discontinued OEM SKUs, and urgent backup coverage when primary distributors cannot fulfill orders.'
      schema={[]}
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

      <section className='w-full bg-white my-5 px-6'>
        <div className='max-w-6xl mx-auto'>
          <header className='text-center'>
            <h1 className='text-4xl font-bold text-[#0e355e] leading-tight'>
              Save on Surgical Supplies and Medical Equipment
            </h1>
            <p className='text-[#414b53] mt-4 max-w-3xl mx-auto text-base font-normal'>
              STAT Surgical Supply acts as a cost-resilience partner for
              hospitals, surgery centers, and healthcare providers. We help you
              save up to <strong>50% on surgical disposables</strong> by
              leveraging out-of-contract purchasing, discontinued OEM SKUs, and
              urgent coverage when primary distributors cannot deliver.
            </p>
          </header>

          <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12'>
            <article className='p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105'>
              <FaDollarSign className='text-5xl text-[#07783e] animate-pulse' />
              <h2 className='text-xl font-bold text-[#0e355e] mt-4'>
                Best Prices on Critical SKUs
              </h2>
              <p className='text-[#414b53] text-sm mt-2 font-normal text-center'>
                Capture savings of up to{" "}
                <strong>50% on selected products</strong> without compromising
                quality. Ideal for volume procedures, high consumption lines,
                and non-contract items that strain your budget.
              </p>
            </article>

            <article className='p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105'>
              <FaHandshake className='text-5xl text-[#07783e]' />
              <h2 className='text-xl font-bold text-[#0e355e] mt-4'>
                Negotiated & Flexible Discounts
              </h2>
              <p className='text-[#414b53] text-sm mt-2 font-normal text-center'>
                Work directly with our team to structure{" "}
                <strong>
                  tiered discounts, spot buys, and project-based pricing
                </strong>{" "}
                that align with your budget cycles, case mix, and capital
                planning.
              </p>
            </article>

            <article className='p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105'>
              <FaChartLine className='text-5xl text-[#07783e]' />
              <h2 className='text-xl font-bold text-[#0e355e] mt-4'>
                Cost Optimization, Not Just “Cheap”
              </h2>
              <p className='text-[#414b53] text-sm mt-2 font-normal text-center'>
                We focus on{" "}
                <strong>OEM-grade, unused, U.S.-sourced inventory</strong> with
                strong dating and sealed OEM packaging, supporting supply chain
                resilience instead of one-time opportunistic deals.
              </p>
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
                  Backorders and supply interruptions that put cases or surgeons
                  at risk
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
                  You share target items, SKUs, or clinical categories that are
                  driving cost pressure.
                </li>
                <li>
                  Our team sources <strong>unused, sealed OEM inventory</strong>{" "}
                  from vetted U.S. healthcare facilities and approved channels.
                </li>
                <li>
                  We present <strong>side-by-side pricing and dating</strong> so
                  your supply chain team can validate savings and quality.
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
                  clinical needs. These items move quickly and are available for
                  a short time only.
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

          <section className='mt-14'>
            <h2 className='text-2xl font-bold text-[#0e355e] mb-4 text-center'>
              Frequently Asked Questions About Savings
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-[#414b53]'>
              <div>
                <h3 className='font-semibold text-[#0e355e]'>
                  Are products new and OEM-grade?
                </h3>
                <p className='mt-1'>
                  Yes. STAT only works with{" "}
                  <strong>unused, factory-sealed OEM products</strong> sourced
                  from verified U.S. healthcare facilities and trusted channels.
                  No gray-market, refurbished, or reprocessed items.
                </p>
              </div>
              <div>
                <h3 className='font-semibold text-[#0e355e]'>
                  Can we use STAT alongside our primary distributor?
                </h3>
                <p className='mt-1'>
                  Absolutely. Most clients use STAT as a{" "}
                  <strong>secondary and contingency supplier</strong> for
                  backorders, discontinued SKUs, non-contract items, and cost
                  optimization projects.
                </p>
              </div>
              <div>
                <h3 className='font-semibold text-[#0e355e]'>
                  How do you document savings?
                </h3>
                <p className='mt-1'>
                  We can provide <strong>item-level comparisons</strong> versus
                  current pricing, including contract vs. STAT pricing, to help
                  your team track and report realized savings over time.
                </p>
              </div>
              <div>
                <h3 className='font-semibold text-[#0e355e]'>
                  What is the minimum order size?
                </h3>
                <p className='mt-1'>
                  We support a wide range of order sizes—from{" "}
                  <strong>case-based urgent needs</strong> to larger
                  optimization projects—so your team can start small and scale
                  as value is proven.
                </p>
              </div>
            </div>
          </section>

          <div className='mt-12 flex flex-col md:flex-row items-center justify-center gap-4'>
            <button
              onClick={() => {
                window.location.href = "/products";
              }}
              className='px-8 py-3 bg-[#07783e] text-white text-lg font-bold rounded-lg shadow-lg hover:bg-[#025e2d] transition-all duration-300 transform hover:scale-105'
            >
              Shop Surgical Supplies
            </button>
            <Link
              href='/#contact'
              className='px-8 py-3 border-2 border-[#07783e] text-[#07783e] text-lg font-bold rounded-lg shadow-sm hover:bg-[#e8f5e9] transition-all duration-300'
            >
              Request a Savings Review
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
