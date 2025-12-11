import {
  FaCheckCircle,
  FaHandshake,
  FaLock,
  FaShieldAlt,
  FaThumbsUp,
  FaUndoAlt,
  FaStar,
  FaUsers,
  FaClock,
} from "react-icons/fa";
import Layout from "../components/main/Layout";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";
import Head from "next/head";

export default function SecureBuyingSelling() {
  const breadcrumbs = [
    { href: "/", name: "Home" },
    { name: "Secure Buying & Selling" },
  ];

  const features = [
    {
      icon: (
        <FaLock className='text-5xl text-[#07783e] group-hover:animate-bounce transition-all duration-300' />
      ),
      title: "Secure Payments",
      description:
        "All transactions are encrypted and verified for maximum security with SSL encryption and PCI compliance.",
      highlight: "256-bit SSL Encryption",
    },
    {
      icon: (
        <FaCheckCircle className='text-5xl text-[#07783e] group-hover:animate-bounce transition-all duration-300' />
      ),
      title: "Verified Suppliers",
      description:
        "We work exclusively with FDA-certified and ISO-compliant surgical equipment suppliers.",
      highlight: "FDA Certified Partners",
    },
    {
      icon: (
        <FaUndoAlt className='text-5xl text-[#07783e] group-hover:animate-bounce transition-all duration-300' />
      ),
      title: "Hassle-Free Returns",
      description:
        "30-day return policy with free shipping for defective or misrepresented items.",
      highlight: "30-Day Guarantee",
    },
    {
      icon: (
        <FaShieldAlt className='text-5xl text-[#07783e] group-hover:animate-bounce transition-all duration-300' />
      ),
      title: "Buyer Protection",
      description:
        "Complete purchase protection with escrow services and dispute resolution support.",
      highlight: "Full Purchase Protection",
    },
    {
      icon: (
        <FaHandshake className='text-5xl text-[#07783e] group-hover:animate-bounce transition-all duration-300' />
      ),
      title: "Fair Market Pricing",
      description:
        "Competitive pricing with price matching and bulk discounts for healthcare facilities.",
      highlight: "Price Match Guarantee",
    },
    {
      icon: (
        <FaThumbsUp className='text-5xl text-[#07783e] group-hover:animate-bounce transition-all duration-300' />
      ),
      title: "24/7 Customer Support",
      description:
        "Round-the-clock customer service with dedicated account managers for healthcare professionals.",
      highlight: "Always Available Support",
    },
  ];

  const stats = [
    { number: "150+", label: "Happy Customers", icon: <FaUsers /> },
    { number: "99.8%", label: "Success Rate", icon: <FaStar /> },
    { number: "24/7", label: "Support Available", icon: <FaClock /> },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Secure Buying & Selling - STAT Surgical Supply",
    description:
      "Safe and secure surgical equipment transactions with verified suppliers, buyer protection, and hassle-free returns.",
    provider: {
      "@type": "Organization",
      name: "STAT Surgical Supply",
      url: "https://statsurgicalsupply.com",
    },
    serviceType: "Medical Equipment Trading",
    areaServed: "United States",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Surgical Equipment",
      itemListElement: features.map((feature) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: feature.title,
          description: feature.description,
        },
      })),
    },
  };

  return (
    <>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <meta name='robots' content='index, follow' />
        <meta
          name='keywords'
          content='secure medical equipment, surgical supplies, verified suppliers, buyer protection, medical device trading'
        />
        <link rel='canonical' href='https://statsurgicalsupply.com/selling' />
        <meta property='og:type' content='website' />
        <meta
          property='og:title'
          content='Secure Buying & Selling | STAT Surgical Supply'
        />
        <meta
          property='og:description'
          content='Safe and secure surgical equipment transactions with verified suppliers, buyer protection, and hassle-free returns.'
        />
        <meta
          property='og:url'
          content='https://statsurgicalsupply.com/selling'
        />
        <meta name='twitter:card' content='summary_large_image' />
        <meta
          name='twitter:title'
          content='Secure Buying & Selling | STAT Surgical Supply'
        />
        <meta
          name='twitter:description'
          content='Safe and secure surgical equipment transactions with verified suppliers, buyer protection, and hassle-free returns.'
        />
      </Head>

      <Layout
        title='Secure Buying & Selling | STAT Surgical Supply'
        description='Safe and secure surgical equipment transactions with verified suppliers, buyer protection, and hassle-free returns for healthcare professionals.'
        schema={[structuredData]}
      >
        {/* Breadcrumb Navigation */}
        <nav className='text-sm text-gray-700' aria-label='Breadcrumb'>
          <ul className='flex ml-0 lg:ml-20 items-center space-x-2 -mt-5'>
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className='flex items-center'>
                {breadcrumb.href ? (
                  <Link
                    href={breadcrumb.href}
                    className='hover:underline text-[#0e355e] transition-colors duration-200'
                    aria-label={`Navigate to ${breadcrumb.name}`}
                  >
                    {breadcrumb.name}
                  </Link>
                ) : (
                  <span className='text-gray-600' aria-current='page'>
                    {breadcrumb.name}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <BsChevronRight
                    className='mx-2 text-gray-500'
                    aria-hidden='true'
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <section className='w-full bg-gradient-to-brpx-6 py-12'>
          <div className='max-w-7xl mx-auto'>
            <header className='text-center mb-16'>
              <h1 className='text-5xl lg:text-6xl font-bold text-[#0e355e] mb-6 leading-tight'>
                Secure Buying & Selling
                <span className='block text-[#07783e] text-3xl lg:text-4xl mt-2 font-semibold'>
                  for Healthcare Professionals
                </span>
              </h1>
              <p className='text-[#414b53] text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed mb-8'>
                We guarantee a safe and hassle-free transaction process with
                verified suppliers, complete buyer protection, and
                industry-leading security measures for all medical equipment
                purchases.
              </p>

              {/* Trust Indicators */}
              <div className='flex flex-wrap justify-center gap-8 mb-12'>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className='text-center bg-white rounded-lg p-4 shadow-sm border border-gray-100'
                  >
                    <div className='text-[#07783e] text-2xl mb-2 flex justify-center'>
                      {stat.icon}
                    </div>
                    <div className='text-3xl font-bold text-[#0e355e]'>
                      {stat.number}
                    </div>
                    <div className='text-sm text-gray-600 font-medium'>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </header>

            {/* Features Grid */}
            <main>
              <h2 className='text-3xl font-bold text-[#0e355e] text-center mb-12'>
                Why Choose Our Secure Platform?
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16'>
                {features.map((feature, index) => (
                  <article
                    key={index}
                    className='group relative p-8 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-[#07783e]/20'
                  >
                    <div className='absolute top-4 right-4 bg-[#07783e]/10 text-[#07783e] text-xs font-bold px-3 py-1 rounded-full'>
                      {feature.highlight}
                    </div>

                    <div className='mb-6 p-4 bg-gradient-to-br from-[#07783e]/5 to-[#07783e]/10 rounded-full'>
                      {feature.icon}
                    </div>

                    <h3 className='text-2xl font-bold text-[#0e355e] mb-4'>
                      {feature.title}
                    </h3>

                    <p className='text-[#414b53] text-base leading-relaxed flex-grow'>
                      {feature.description}
                    </p>

                    <div className='w-full h-1 bg-gradient-to-r from-[#07783e] to-[#025e2d] rounded-full mt-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></div>
                  </article>
                ))}
              </div>
            </main>

            {/* Call to Action */}
            <section className='text-center bg-gradient-to-r bg-gray-100 rounded-2xl p-12 text-black shadow-2xl'>
              <h2 className='text-3xl font-bold mb-4'>
                Ready to Start Trading Securely?
              </h2>
              <p className='text-xl mb-8 opacity-90'>
                Join thousands of healthcare professionals who trust our
                platform
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <button
                  onClick={() => (window.location.href = "/products")}
                  className='px-10 py-4 bg-white text-[#07783e] text-lg font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-gray-50'
                  aria-label='Start shopping for medical equipment securely'
                >
                  Start Shopping Securely
                </button>

                <Link
                  href='/Register'
                  className='px-10 py-4 border-2 border-[#07783e] text-[#07783e] text-lg font-bold rounded-xl hover:bg-white hover:text-[#07783e] transition-all duration-300 transform hover:scale-105'
                  aria-label='Create a secure account'
                >
                  Create Account
                </Link>
              </div>

              <p className='text-sm mt-6 opacity-75'>
                No setup fees • SSL secured • HIPAA compliant
              </p>
            </section>
          </div>
        </section>
      </Layout>
    </>
  );
}
