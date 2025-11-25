import {
  FaBoxOpen,
  FaDollarSign,
  FaHeadset,
  FaShieldAlt,
} from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import { generateServicePageJSONLD } from "../utils/seo";

const benefits = [
  {
    icon: <FaDollarSign />,
    title: "Guaranteed Savings on Surgical Supplies",
    description:
      "Save up to 50% on surgical disposables and medical equipment.",
    link: "/savings",
  },
  {
    icon: <FaBoxOpen />,
    title: "In-Stock Surgical Products with Fast Delivery",
    description: "Wide selection of medical supplies ready to ship nationwide.",
    link: "/products",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure Buying & Selling Process",
    description:
      "Sell or buy surgical products with confidence and verified procedures.",
    link: "/selling",
  },
  {
    icon: <FaHeadset />,
    title: "Dedicated Support for Medical Professionals",
    description:
      "Talk to our team via email, phone, or schedule a visit at our warehouse.",
    link: "/support",
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
  return (
    <section className='w-full my-16' schema={generateServicePageJSONLD()}>
      <h2 className='text-3xl font-bold text-center text-[#0e355e]'>
        Our Key Benefits
      </h2>
      <p className='text-[#414b53de] text-base font-normal text-center mt-2'>
        Discover why clinics, hospitals, and medical professionals choose <br />
        STAT Surgical Supply for high-quality surgical disposables and medical
        equipment.
      </p>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-10'>
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className='flex items-center p-6 bg-white border-l-4 border-[#03793d] rounded-lg shadow-md group'
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.2 }}
            custom={index}
            variants={variants}
          >
            <div className='text-4xl text-[#03793d] p-4 bg-gray-100 rounded-full transform transition-transform duration-300 group-hover:-rotate-12'>
              {benefit.icon}
            </div>
            <div className='ml-5 flex-1'>
              <h3 className='text-xl font-semibold text-[#0e355e]'>
                {benefit.title}
              </h3>
              <p className='text-gray-600 mt-1'>{benefit.description}</p>
              <Link
                href={benefit.link}
                className='inline-block mt-3 text-[#03793d] font-medium hover:underline'
              >
                Learn More →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
