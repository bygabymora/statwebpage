import {
  FaCheckCircle,
  FaHandshake,
  FaLock,
  FaShieldAlt,
  FaThumbsUp,
  FaUndoAlt,
} from "react-icons/fa";
import Layout from "../components/main/Layout";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";

export default function SecureBuyingSelling() {
  const breadcrumbs = [
    { href: "/", name: "Home" },
    { name: "Secure Buying & Selling" },
  ];

  const features = [
    {
      icon: (
        <FaLock className='text-5xl text-[#07783e] group-hover:animate-bounce' />
      ),
      title: "Secure Payments",
      description:
        "All transactions are encrypted and verified for maximum security.",
    },
    {
      icon: (
        <FaCheckCircle className='text-5xl text-[#07783e] group-hover:animate-bounce' />
      ),
      title: "Verified Suppliers",
      description: "We work exclusively with certified and trusted suppliers.",
    },
    {
      icon: (
        <FaUndoAlt className='text-5xl text-[#07783e] group-hover:animate-bounce' />
      ),
      title: "Hassle-Free Returns",
      description: "Easily return products that do not meet expectations.",
    },
    {
      icon: (
        <FaShieldAlt className='text-5xl text-[#07783e] group-hover:animate-bounce' />
      ),
      title: "Buyer Protection",
      description: "We offer guarantees to protect your purchases and sales.",
    },
    {
      icon: (
        <FaHandshake className='text-5xl text-[#07783e] group-hover:animate-bounce' />
      ),
      title: "Fair Deals",
      description:
        "We ensure you get the best value on every deal, whether buying from or selling to us.",
    },
    {
      icon: (
        <FaThumbsUp className='text-5xl text-[#07783e] group-hover:animate-bounce' />
      ),
      title: "Customer Satisfaction",
      description: "Our support team is always ready to assist you.",
    },
  ];

  return (
    <Layout title={"Secure Buying & Selling"}>
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

      <section className='w-full bg-white px-6'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-4xl font-bold text-[#0e355e]'>
            Secure Buying & Selling
          </h2>
          <p className='text-lg text-[#414b53] mt-4 max-w-3xl mx-auto'>
            We guarantee a safe and hassle-free transaction process, ensuring
            trust and transparency in every purchase and sale.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='group p-6 bg-[#f8f9fa] rounded-xl shadow-md flex flex-col items-center transition-transform duration-300 hover:scale-105'
              >
                {feature.icon}
                <h4 className='text-xl font-bold text-[#0e355e] mt-4'>
                  {feature.title}
                </h4>
                <p className='text-[#414b53] text-sm mt-2'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className='mt-10 my-10'>
            <button
              onClick={() => (window.location.href = "/products")}
              className='px-8 py-3 bg-[#07783e] text-white text-lg font-bold rounded-lg shadow-lg hover:bg-[#025e2d] transition-all duration-300 transform hover:scale-105'
            >
              Start Shopping Securely
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
