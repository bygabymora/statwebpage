import React, { useState } from "react";
import Layout from "../components/main/Layout";
import { FaQuestionCircle } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";

const faqData = [
  {
    question: "How long does a typical surgical procedure last?",
    answer:
      "Most minor procedures take between 30 minutes and 2 hours. Major surgeries can range from 2 to 6 hours or more depending on complexity and patient factors.",
  },
  {
    question: "What factors influence the duration of surgery?",
    answer:
      "Procedure complexity, patient health, anesthesia type, and the surgical team’s experience all play a role in how long a surgery takes.",
  },
  {
    question: "How sterile are surgical supplies upon delivery?",
    answer:
      "All our supplies are terminally sterilized and arrive in sealed, tamper-evident packaging that meets FDA and ISO 13485 standards.",
  },
  {
    question:
      "Can surgical supplies expire, and how do I check their expiration dates?",
    answer:
      "Yes—every sterilized item has an expiration date printed on its packaging. You can also find lot and expiry details in your order confirmation or by inspecting the package label.",
  },
  {
    question: "How should I store surgical instruments to maintain sterility?",
    answer:
      "Keep items in a clean, dry environment at room temperature, away from direct sunlight and moisture. Do not break the sterile seal until immediately before use.",
  },
  {
    question: "How far in advance should I order surgical supplies?",
    answer:
      "For standard items, we recommend ordering at least 7-10 days before your scheduled procedure. For large or custom orders, allow 2-3 weeks to ensure availability.",
  },
  {
    question:
      "What surgical supplies are most commonly used in outpatient procedures?",
    answer:
      "Common outpatient surgical supplies include scalpels, sutures, sterile gloves, gauze, drapes, and disposable instruments. We carry all essentials to support clinics and ambulatory surgical centers.",
  },
  {
    question: "Do you offer same-day shipping for surgical instruments?",
    answer:
      "Yes, we provide same-day shipping on in-stock items ordered before 2 PM EST. Urgent deliveries are available for clinics and hospitals with time-sensitive procedures.",
  },
  {
    question:
      "Do you provide bulk discounts for hospitals and surgical centers?",
    answer:
      "Yes. We support high-volume procurement with tiered pricing and dedicated account managers. Contact us for a custom quote tailored to your supply needs.",
  },
  {
    question: "How do I verify the authenticity of a surgical product?",
    answer:
      "Each product includes lot numbers and expiration dates for traceability. Certificates and manufacturer information can be cross-verified with our team or on the product's documentation.",
  },
  {
    question:
      "What payment methods are accepted for placing surgical supply orders?",
    answer:
      "We accept credit cards, wire payments, and purchase orders (POs) for approved institutions. Financing terms may be available for repeat customers.",
  },
  {
    question:
      "Do you ship medical devices internationally or only within the U.S.?",
    answer:
      "Currently, we primarily ship within the continental U.S. For international shipping or export requests, please contact our logistics department for options.",
  },
  {
    question:
      "How do I set up recurring orders for frequently used surgical supplies?",
    answer:
      "Our system allows you to set up recurring shipments based on your inventory cycle. This helps avoid shortages and ensures supplies arrive on time, every time.",
  },
  {
    question:
      "What makes Stat Surgical Supply different from other medical supply companies?",
    answer:
      "We focus on speed, personalized service, and a deep inventory of sterile surgical products — all at a low cost. Our clients appreciate our fast response times, flexible ordering, and our commitment to delivering high-quality medical supplies at affordable prices.",
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "FAQs" }];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href && {
        item: `https://www.statsurgicalsupply.com${item.href}`,
      }),
    })),
  };

  // JSON-LD Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <Layout
      title='Frequently Asked Questions'
      schema={[faqSchema, breadcrumbSchema]}
    >
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2 -mt-4'>
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
      <section className='max-w-4xl mx-auto px-4 py-10 -mt-8'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-[#0e355e] mb-2'>
            Frequently Asked Questions
          </h1>
          <h3 className='text-[#414b53de] text-base font-normal text-center mb-6'>
            Get quick answers to common inquiries about surgical procedures,
            ordering surgical tools, and maintaining sterile medical equipment.
          </h3>
        </div>

        <div className='mt-10 space-y-5'>
          {faqData.map((item, idx) => (
            <div
              key={idx}
              className='bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200'
            >
              <button
                onClick={() => toggle(idx)}
                className='w-full flex items-center justify-between px-6 py-5 focus:outline-none'
              >
                <div className='flex items-center space-x-4 text-left'>
                  <div className='p-2 bg-green-100 rounded-full'>
                    <FaQuestionCircle className='text-[#07783e]' />
                  </div>
                  <h2 className='text-lg font-medium text-gray-800'>
                    {item.question}
                  </h2>
                </div>
                <IoChevronDown
                  className={`text-2xl text-gray-500 transform transition-transform duration-300 ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === idx && (
                <div className='px-6 pb-6 text-gray-600 animate-fade-in-down'>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className='text-center mt-12'>
          <p className='text-lg text-gray-700'>
            Didn’t find what you’re looking for?
          </p>
          <Link
            href='/support'
            className='inline-block mt-3 px-6 py-3 bg-[#0e355e] text-white rounded-xl hover:bg-[#07294c] transition'
          >
            Contact Our Support Team
          </Link>
        </div>
      </section>
      {/* Custom animation */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }
      `}</style>
    </Layout>
  );
}
