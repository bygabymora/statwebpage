import {
  FaBoxOpen,
  FaDollarSign,
  FaHeadset,
  FaShieldAlt,
} from "react-icons/fa";
import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: <FaDollarSign />,
    title: "Guaranteed Savings on Premium Surgical Supplies",
    description:
      "Save up to 50% on surgical disposables, medical equipment, and hospital-grade instruments. Bulk pricing available for healthcare facilities.",
    link: "/savings",
    keywords:
      "surgical supplies savings, bulk medical equipment pricing, healthcare cost reduction",
    ariaLabel:
      "Learn about guaranteed savings on surgical supplies and medical equipment",
  },
  {
    icon: <FaBoxOpen />,
    title: "In-Stock Medical Products with Same-Day Shipping",
    description:
      "Extensive inventory of sterile surgical disposables and medical supplies ready for immediate nationwide delivery to healthcare facilities.",
    link: "/products",
    keywords:
      "in-stock surgical products, fast medical supply delivery, nationwide shipping",
    ariaLabel:
      "Browse our complete inventory of medical supplies with fast delivery",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure Healthcare Equipment Trading Process",
    description:
      "Buy or sell surgical products through our verified, secure platform designed specifically for medical professionals and healthcare institutions.",
    link: "/selling",
    keywords:
      "secure medical equipment trading, verified surgical supply marketplace",
    ariaLabel:
      "Learn about our secure process for buying and selling medical equipment",
  },
  {
    icon: <FaHeadset />,
    title: "Expert Support for Healthcare Professionals",
    description:
      "Connect with our medical supply specialists via phone, email, or schedule an in-person consultation at our warehouse facility.",
    link: "/support",
    keywords:
      "medical supply support, healthcare equipment consultation, surgical supply experts",
    ariaLabel: "Contact our expert support team for personalized assistance",
  },
];

const variants = {
  hidden: { opacity: 0, x: 100 }, // starts shifted to the right and hidden
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.3,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function BenefitsSection() {
  // Service Schema for enhanced SEO
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Medical Surgical Supply Services",
    provider: {
      "@type": "Organization",
      name: "STAT Surgical Supply",
      url: "https://www.statsurgicalsupply.com",
    },
    description:
      "Comprehensive surgical supply services including cost savings, fast delivery, secure trading, and expert support for healthcare professionals.",
    serviceType: "Medical Equipment Supply",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much can I save on surgical supplies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can save up to 50% on surgical disposables and medical equipment through our bulk pricing and cost-saving solutions.",
        },
      },
      {
        "@type": "Question",
        name: "How fast is delivery for medical supplies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer same-day shipping on in-stock items with nationwide delivery to healthcare facilities.",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      </Head>
      <section
        className='w-full my-16'
        aria-labelledby='benefits-heading'
        role='region'
      >
        <header className='text-center mb-10'>
          <h2
            id='benefits-heading'
            className='text-3xl font-bold text-center text-[#0e355e]'
          >
            Why Healthcare Professionals Choose STAT Surgical Supply
          </h2>
          <p className='text-[#414b53de] text-base font-normal text-center mt-2 max-w-3xl mx-auto'>
            Discover why over 150+ clinics, hospitals, and medical professionals
            trust STAT Surgical Supply for premium surgical disposables, medical
            equipment, and exceptional healthcare solutions nationwide.
          </p>
        </header>

        <div
          className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-10'
          role='list'
          aria-label='Key benefits of STAT Surgical Supply services'
        >
          {benefits.map((benefit, index) => (
            <motion.article
              key={index}
              className='flex items-center p-6 bg-white border-l-4 border-[#03793d] rounded-lg shadow-md group'
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, amount: 0.2 }}
              custom={index}
              variants={variants}
              role='listitem'
              itemScope
              itemType='https://schema.org/Service'
            >
              <div
                className='text-4xl text-[#03793d] p-4 bg-gray-100 rounded-full transform transition-transform duration-300 group-hover:-rotate-12'
                aria-hidden='true'
                role='presentation'
              >
                {benefit.icon}
              </div>
              <div className='ml-5 flex-1'>
                <h3
                  className='text-xl font-semibold text-[#0e355e]'
                  itemProp='name'
                >
                  {benefit.title}
                </h3>
                <p className='text-gray-600 mt-1' itemProp='description'>
                  {benefit.description}
                </p>
                <Link
                  href={benefit.link}
                  className='inline-block mt-3 text-[#03793d] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#03793d] focus:ring-opacity-50 rounded'
                  aria-label={benefit.ariaLabel}
                  title={`Learn more about ${benefit.title.toLowerCase()}`}
                  itemProp='url'
                >
                  Learn More →
                </Link>
                <meta itemProp='keywords' content={benefit.keywords} />
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
