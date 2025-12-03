import React, { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaQuestionCircle,
  FaClock,
  FaHeadset,
  FaShieldAlt,
  FaAward,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { BsGeoAlt, BsClock, BsEnvelope, BsTelephone } from "react-icons/bs";
import Layout from "../components/main/Layout";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";

export default function Support() {
  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "Support" }];
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "How long does support take to respond?",
      answer:
        "We usually respond within 24 hours. For urgent matters, please call us directly at +1 813-252-0727.",
    },
    {
      question: "How do you acquire your products?",
      answer:
        "Stat Surgical acquires products from domestic hospitals, surgery centers, and trusted suppliers, ensuring authenticity and quality.",
    },
    {
      question: "What is the expiration dating of your products?",
      answer:
        "Stat Surgical strives to provide long-dated products. Typically products have 1-3+ years until expiration. We never send short-dated products unless approved by the customer.",
    },
    {
      question: "Are your products in original packaging?",
      answer:
        "All products arrive in original manufacturer packaging, exactly as if shipped directly from the source.",
    },
    {
      question: "Can I negotiate prices on surgical and medical supplies?",
      answer:
        "Stat Surgical has the best prices in the business. We will never let pricing get in the way of our strong relationships with our customers. If pricing is an issue, we will make it work!",
    },
    {
      question: "What payment methods do you accept for billing?",
      answer:
        "We accept purchase orders from domestic hospitals and surgery centers. Other approved customers can pay via ACH, wire transfer, domestic credit card, or domestic PayPal.",
    },
    {
      question: "Can I buy items individually or do I have to buy a full box?",
      answer:
        "Unlike manufacturer minimums, you can purchase single items or full boxes. Cost savings are always our priority!",
    },
  ];

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

      {/* Hero Section */}
      <section className='bg-gradient-to-br from-[#144e8b] to-[#0e355e] text-white py-16 px-6 mb-12 rounded-xl mx-4 lg:mx-20'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6'>
            <FaHeadset className='text-4xl text-white' />
          </div>
          <h1 className='text-4xl lg:text-5xl font-bold mb-4'>
            Professional Customer Support
          </h1>
          <h2 className='text-xl lg:text-2xl font-light mb-6 text-blue-100'>
            Expert assistance for medical professionals
          </h2>
          <p className='text-lg leading-relaxed max-w-3xl mx-auto text-blue-50'>
            Need assistance with your surgical supply order or product
            questions? Our dedicated support team is here to help medical
            professionals like you with personalized service and expert
            guidance.
          </p>
          <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='tel:+18132520727'
              className='inline-flex items-center px-8 py-3 bg-white text-[#144e8b] font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg'
            >
              <FaPhone className='mr-2' />
              Call Now: (813) 252-0727
            </a>
            <a
              href='mailto:centralsales@statsurgicalsupply.com'
              className='inline-flex items-center px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#144e8b] transition-all'
            >
              <FaEnvelope className='mr-2' />
              Send Email
            </a>
          </div>
        </div>
      </section>

      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        {/* Contact Methods Grid */}
        <section className='mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
              Get In Touch
            </h2>
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
        </section>

        {/* Why Choose Our Support */}
        <section className='mb-16 bg-gray-50 rounded-xl p-8'>
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
                Over 15 years of experience in medical supply distribution and
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
                Quick turnaround times to keep your medical facility running
                smoothly.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Map */}
        <section className='mb-16'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
              Find Our Location
            </h2>
            <p className='text-lg text-gray-600'>
              Located in the heart of Tampa, Florida
            </p>
          </div>

          <div className='rounded-2xl overflow-hidden shadow-2xl border-4 border-[#144e8b]'>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d881.1556225029047!2d-82.45766380676294!3d27.944216161107967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c59877a39355%3A0xd495507c20fbd5f0!2sStat%20Surgical%20Supply!5e0!3m2!1sen!2sco!4v1748536969142!5m2!1sen!2sco'
              className='w-full h-96 lg:h-[500px]'
              allowFullScreen
              title='Stat Surgical Supply Location Map'
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
            />
          </div>
        </section>

        {/* Enhanced FAQ Section */}
        <section className='mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
              Frequently Asked Questions
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Quick answers to common questions about our medical supply
              services
            </p>
          </div>

          <div className='max-w-4xl mx-auto space-y-4'>
            {faqData.map((faq, index) => (
              <div
                key={index}
                className='bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden'
              >
                <button
                  className='w-full p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#144e8b] focus:ring-inset'
                  onClick={() => toggleFaq(index)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 w-8 h-8 bg-[#144e8b] rounded-full flex items-center justify-center mr-4'>
                        <FaQuestionCircle className='text-white text-sm' />
                      </div>
                      <h3 className='text-lg font-semibold text-[#144e8b] pr-4'>
                        {faq.question}
                      </h3>
                    </div>
                    <div className='flex-shrink-0'>
                      {openFaq === index ? (
                        <FaChevronUp className='text-[#144e8b] text-xl' />
                      ) : (
                        <FaChevronDown className='text-[#144e8b] text-xl' />
                      )}
                    </div>
                  </div>
                </button>

                {openFaq === index && (
                  <div className='px-6 pb-6'>
                    <div className='ml-12 p-4 bg-gray-50 rounded-lg border-l-4 border-[#144e8b]'>
                      <p className='text-gray-700 leading-relaxed'>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </Layout>
  );
}
