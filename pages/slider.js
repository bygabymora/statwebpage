import {
  FaBoxOpen,
  FaDollarSign,
  FaHeadset,
  FaShieldAlt,
} from "react-icons/fa";
import Link from "next/link";

const benefits = [
  {
    icon: <FaDollarSign />,
    title: "Guaranteed Savings",
    description: "Save up to 50% on selected products.",
    link: "/savings",
  },
  {
    icon: <FaBoxOpen />,
    title: "Available Stock",
    description: "Diverse catalog with fast delivery.",
    link: "/products",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure Buying & Selling",
    description: "Reliable and verified processes.",
    link: "/selling",
  },
  {
    icon: <FaHeadset />,
    title: "Support",
    description: "Email, phone, or schedule a visit at our location.",
    link: "/support",
  },
];

export default function BenefitsSection() {
  return (
    <section className='w-full my-10'>
      <h2 className='text-3xl font-bold text-center text-[#0e355e]'>
        Our Key Benefits
      </h2>
      <p className='text-center text-lg text-gray-600 mt-2'>
        Discover why we are the trusted choice in surgical supplies.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-10'>
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className='flex items-center p-6 bg-white border-l-4 border-[#03793d] rounded-lg shadow-md 
            transition-transform duration-300 hover:scale-105 hover:shadow-lg group'
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
          </div>
        ))}
      </div>
    </section>
  );
}
