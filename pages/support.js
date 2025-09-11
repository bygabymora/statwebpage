import React from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import Layout from "../components/main/Layout";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";

export default function Support() {
  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "Support" }];
  return (
    <Layout title='Customer Support'>
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
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
      <section className='w-full min-h-screen flex justify-center items-center px-6'>
        <div className='max-w-4xl w-full p-10 text-center'>
          <h1 className='text-4xl font-bold text-[#0e355e]'>
            Customer Support for Surgical & Medical Supplies
          </h1>
          <h3 className='text-[#414b53] mt-4 font-normal text-base'>
            Need assistance with your surgical supply order or product
            questions? Contact our support team by phone, email, or visit us in
            person. we’re here to help medical professionals like you.
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10'>
            <div className='flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105'>
              <FaMapMarkerAlt className='text-5xl text-[#07783e]' />
              <h4 className='font-bold text-[#0e355e] mt-3'>Visit Us</h4>
              <p className='text-[#414b53] text-sm mt-1'>
                100 Ashley Dr S #600, Tampa, FL
              </p>
            </div>

            <div className='flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105'>
              <FaPhone className='text-5xl text-[#07783e]' />
              <h4 className='font-bold text-[#0e355e] mt-3'>
                Call Our Support Team
              </h4>
              <a
                className='text-[#414b53] text-sm mt-1'
                href='tel:+18132520727'
                title='Call Support'
              >
                +1 813-252-0727
              </a>
            </div>

            <div className='flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105'>
              <FaEnvelope className='text-5xl text-[#07783e]' />
              <h4 className='font-bold text-[#0e355e] mt-3'>
                Email Our Support Team
              </h4>
              <a
                className='text-[#414b53] text-sm mt-1'
                title='Email Support equipment'
                href='mailto:centralsales@statsurgicalsupply.com?subject=Support%20Request&body=Hello,%20I%20need%20help%20with...'
              >
                centralsales@statsurgicalsupply.com
              </a>
            </div>
          </div>

          <div className='mt-12 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-[#07783e]'>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d881.1556225029047!2d-82.45766380676294!3d27.944216161107967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c59877a39355%3A0xd495507c20fbd5f0!2sStat%20Surgical%20Supply!5e0!3m2!1sen!2sco!4v1748536969142!5m2!1sen!2sco'
              className='w-full h-96'
              allowFullScreen
              title='Location Map'
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
            />
          </div>

          <div className='mt-10 text-left'>
            <h3 className='text-2xl font-bold text-[#0e355e]'>
              Frequently Asked Questions
            </h3>
            <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-md'>
              <h4 className='flex items-center text-[#414b53]'>
                <FaQuestionCircle className='text-[#07783e] mr-2' /> How long
                does support take to respond?
              </h4>
              <h5 className='mt-2 text-sm text-gray-600'>
                We usually respond within 24 hours.
              </h5>
            </div>
            <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-md'>
              <h4 className='flex items-center text-[#414b53]'>
                <FaQuestionCircle className='text-[#07783e] mr-2' /> How do you
                acquire your products?
              </h4>
              <h5 className='mt-2 text-sm text-gray-600'>
                Stat Surgical acquires products from domestic hospitals, surgery
                centers, and trusted suppliers.
              </h5>
            </div>
            <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-md'>
              <h4 className='flex items-center text-[#414b53]'>
                <FaQuestionCircle className='text-[#07783e] mr-2' /> What is the
                expiration dating of your products?
              </h4>
              <h5 className='mt-2 text-sm text-gray-600'>
                Stat Surgical strives to provide long-dated products. Typically
                products have 1-3+ years until expiration. We never send
                short-dated products unless approved by the customer.
              </h5>
            </div>
            <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-md'>
              <h4 className='flex items-center text-[#414b53]'>
                <FaQuestionCircle className='text-[#07783e] mr-2' /> Are your
                products in original packaging?
              </h4>
              <h5 className='mt-2 text-sm text-gray-600'>
                All products arrive in original manufacturer packaging, exactly
                as if shipped directly from the source.
              </h5>
            </div>
            <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-md'>
              <h4 className='flex items-center text-[#414b53]'>
                <FaQuestionCircle className='text-[#07783e] mr-2' /> Can I
                negotiate prices on surgical and medical supplies?
              </h4>
              <h5 className='mt-2 text-sm text-gray-600'>
                Stat Surgical has the best prices in the business. We will never
                let pricing get in the way of our “strong” relationships with
                our customers. If pricing is an issue, we will make it work!
              </h5>
            </div>
            <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-md'>
              <h4 className='flex items-center text-[#414b53]'>
                <FaQuestionCircle className='text-[#07783e] mr-2' /> What
                payment methods do you accept for billing?
              </h4>
              <h5 className='mt-2 text-sm text-gray-600'>
                We accept purchase orders from domestic hospitals and surgery
                centers. Other approved customers can pay via ACH, wire
                transfer, domestic credit card, or domestic PayPal.
              </h5>
            </div>
            <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-md'>
              <h4 className='flex items-center text-[#414b53]'>
                <FaQuestionCircle className='text-[#07783e] mr-2' /> Can I buy
                items individually or do I have to buy a full box?
              </h4>
              <h5 className='mt-2 text-sm text-gray-600'>
                Unlike manufacturer minimums, you can purchase single items or
                full boxes. Cost savings are always our priority!
              </h5>
            </div>
          </div>
        </div>
      </section>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How long does support take to respond?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We usually respond within 24 hours.",
                },
              },
              {
                "@type": "Question",
                name: "How do you acquire your products?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Stat Surgical acquires products from domestic hospitals, surgery centers, and trusted suppliers.",
                },
              },
              {
                "@type": "Question",
                name: "What is the expiration dating of your products?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Stat Surgical strives to provide long-dated products. Typically products have 1–3+ years until expiration. We never send short-dated products unless approved by the customer.",
                },
              },
              {
                "@type": "Question",
                name: "Are your products in original packaging?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "All products arrive in original manufacturer packaging, exactly as if shipped directly from the source.",
                },
              },
              {
                "@type": "Question",
                name: "Can I negotiate prices on surgical and medical supplies?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Stat Surgical has the best prices in the business. We will never let pricing get in the way of our relationships with our customers. If pricing is an issue, we will make it work!",
                },
              },
              {
                "@type": "Question",
                name: "What payment methods do you accept for billing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We accept purchase orders from domestic hospitals and surgery centers. Other approved customers can pay via ACH, wire transfer, domestic credit card, or domestic PayPal.",
                },
              },
              {
                "@type": "Question",
                name: "Can I buy items individually or do I have to buy a full box?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Unlike manufacturer minimums, you can purchase single items or full boxes. Cost savings are always our priority!",
                },
              },
            ],
          }),
        }}
      />
    </Layout>
  );
}
