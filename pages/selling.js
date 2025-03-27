import { FaCheckCircle, FaHandshake, FaLock, FaShieldAlt, FaThumbsUp, FaUndoAlt } from "react-icons/fa";
import Layout from "../components/main/Layout";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";

export default function SecureBuyingSelling() {

  const breadcrumbs = [
    { href: '/', name: 'Home' },
    { name: 'Secure Buying & Selling' },
  ];

  return (
    <Layout title={'Secure Buying & Selling'}>
      <nav className="text-sm text-gray-700">
        <ul className="flex ml-0 lg:ml-20 items-center space-x-2">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className="flex items-center">
              {breadcrumb.href ? (
                <Link href={breadcrumb.href} className="hover:underline text-[#144e8b]">
                  {breadcrumb.name}
                </Link>
              ) : (
                <span>{breadcrumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className="mx-2 text-gray-500" />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <section className="w-full bg-white px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#144e8b]">Secure Buying & Selling</h2>
          <p className="text-lg text-[#414b53] mt-4 max-w-3xl mx-auto">
            We guarantee a safe and hassle-free transaction process, ensuring trust and transparency in every purchase and sale.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            <div className="p-6 bg-[#f8f9fa] rounded-xl shadow-md flex flex-col items-center">
              <FaLock className="text-5xl text-[#03793d]" />
              <h4 className="text-xl font-bold text-[#144e8b] mt-4">Secure Payments</h4>
              <p className="text-[#414b53] text-sm mt-2">All transactions are encrypted and verified for maximum security.</p>
            </div>

            <div className="p-6 bg-[#f8f9fa] rounded-xl shadow-md flex flex-col items-center">
              <FaCheckCircle className="text-5xl text-[#03793d]" />
              <h4 className="text-xl font-bold text-[#144e8b] mt-4">Verified Sellers</h4>
              <p className="text-[#414b53] text-sm mt-2">We work exclusively with certified and trusted suppliers.</p>
            </div>

            <div className="p-6 bg-[#f8f9fa] rounded-xl shadow-md flex flex-col items-center">
              <FaUndoAlt className="text-5xl text-[#03793d]" />
              <h4 className="text-xl font-bold text-[#144e8b] mt-4">Hassle-Free Returns</h4>
              <p className="text-[#414b53] text-sm mt-2">Easily return products that do not meet expectations.</p>
            </div>

            <div className="p-6 bg-[#f8f9fa] rounded-xl shadow-md flex flex-col items-center">
              <FaShieldAlt className="text-5xl text-[#03793d]" />
              <h4 className="text-xl font-bold text-[#144e8b] mt-4">Buyer Protection</h4>
              <p className="text-[#414b53] text-sm mt-2">We offer guarantees to protect your purchases and sales.</p>
            </div>

            <div className="p-6 bg-[#f8f9fa] rounded-xl shadow-md flex flex-col items-center">
              <FaHandshake className="text-5xl text-[#03793d]" />
              <h4 className="text-xl font-bold text-[#144e8b] mt-4">Fair Deals</h4>
              <p className="text-[#414b53] text-sm mt-2">We ensure that both buyers and sellers get the best value.</p>
            </div>

            <div className="p-6 bg-[#f8f9fa] rounded-xl shadow-md flex flex-col items-center">
              <FaThumbsUp className="text-5xl text-[#03793d]" />
              <h4 className="text-xl font-bold text-[#144e8b] mt-4">Customer Satisfaction</h4>
              <p className="text-[#414b53] text-sm mt-2">Our support team is always ready to assist you.</p>
            </div>
          </div>

          <div className="mt-10 my-10">
            <button href="/products" className="px-8 py-3 bg-[#03793d] text-white text-lg font-bold rounded-lg shadow-lg hover:bg-[#025e2d] transition-all duration-300 transform hover:scale-105">
              Start Shopping Securely
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}