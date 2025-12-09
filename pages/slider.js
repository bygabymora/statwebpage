// pages/slider.js
import {
  FaBoxOpen,
  FaDollarSign,
  FaHeadset,
  FaShieldAlt,
} from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import { generateServicePageJSONLD } from "../utils/seo";

const benefits = [
  {
    icon: <FaDollarSign />,
    title: "Guaranteed Savings on Premium Surgical Supplies",
    description:
      "Designed for out-of-contract procurement, discontinued SKUs, and urgent supply needs when primary distributors cannot fulfill orders, while delivering savings of up to 50% on surgical disposables.",
    extra: {
      heading: "Ideal for:",
      bullets: [
        "Out-of-contract hospital purchasing",
        "Discontinued and hard-to-source OEM SKUs",
        "Cost containment initiatives",
        "Urgent surgical demand coverage",
      ],
    },
    link: "/savings",
    ariaLabel:
      "Learn about guaranteed savings on surgical supplies and medical equipment",
    keywords:
      "surgical supplies savings, bulk medical equipment pricing, healthcare cost reduction",
  },
  {
    icon: <FaBoxOpen />,
    title: "In-Stock Medical Products with Next-Day Shipping",
    description:
      "Next-Day shipping applies to in-stock items confirmed before cutoff time. Expedited and overnight options are available based on destination.",
    extra: {
      heading: "Shipping support includes:",
      bullets: [
        "Same-day processing for confirmed inventory",
        "Next-day and expedited shipping options",
        "Nationwide U.S. delivery",
        "Clear cutoff times per shipment method",
      ],
    },
    link: "/products",
    ariaLabel:
      "Browse our complete inventory of medical supplies with fast delivery",
    keywords:
      "in-stock surgical products, fast medical supply delivery, nationwide shipping",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure Healthcare Equipment Trading Process",
    description:
      "Buy or sell surgical products through our verified, secure platform for medical professionals and healthcare institutions. All products are unused, sealed, and sourced from verified U.S. healthcare facilities and OEM-approved channels.",
    extra: {
      heading: "Compliance standards:",
      bullets: [
        "Unused and factory-sealed products only",
        "OEM-compatible and verified sourcing",
        "U.S.-based healthcare facilities",
        "Quality and expiration date controls",
      ],
    },
    link: "/selling",
    ariaLabel:
      "Learn about our secure process for buying and selling medical equipment",
    keywords:
      "secure medical equipment trading, verified surgical supply marketplace",
  },
  {
    icon: <FaHeadset />,
    title: "Expert Support for Healthcare Professionals",
    description:
      "STAT complements primary distributor relationships by providing healthcare professionals with rapid response support for urgent, complex, or hard-to-source requests.",
    extra: {
      heading: "Support scenarios:",
      bullets: [
        "Backorders and supply interruptions",
        "Urgent procedural requirements",
        "Discontinued or constrained SKUs",
        "Short-notice surgical scheduling",
      ],
    },
    link: "/support",
    ariaLabel: "Contact our expert support team for personalized assistance",
    keywords:
      "medical supply support, healthcare equipment consultation, surgical supply experts",
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

const serviceJsonLd = generateServicePageJSONLD(
  "Healthcare Supply Services Overview",
  "services",
  "Overview of how STAT Surgical Supply supports healthcare facilities with secondary sourcing, savings and contingency inventory."
);

export default function BenefitsSection() {
  return (
    <>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
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
          <p className='sr-only'>
            STAT Surgical Supply operates as a secondary and contingency medical
            supplier, supporting hospitals and surgical centers when primary
            distributors are unable to meet urgency, availability, or cost
            requirements.
          </p>
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
              key={benefit.title}
              className='flex items-start p-6 bg-white border-l-4 border-[#03793d] rounded-lg shadow-md group'
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
                className='text-4xl text-[#03793d] p-4 bg-gray-100 rounded-full transform transition-transform duration-300 group-hover:-rotate-12 shrink-0'
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

                {benefit.extra && (
                  <div className='benefit-extra mt-3 hidden md:block'>
                    <p className='text-sm font-semibold text-[#0e355e]'>
                      {benefit.extra.heading}
                    </p>
                    <ul className='mt-1 list-disc list-inside text-sm text-gray-500 space-y-0.5'>
                      {benefit.extra.bullets.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
