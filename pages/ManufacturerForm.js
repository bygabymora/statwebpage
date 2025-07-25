import React, { useRef, useState } from "react";
import { BiMessageAdd } from "react-icons/bi";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../components/main/Layout";
import { useModalContext } from "../components/context/ModalContext";
import handleSendEmails from "../utils/alertSystem/documentRelatedEmail";
import { messageManagement } from "../utils/alertSystem/customers/messageManagement";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";

export default function ManufacturerForm() {
  const form = useRef();
  const { showStatusMessage } = useModalContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [productName, setProductName] = useState("");
  const [emailManufacturer, setEmailManufacturer] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    const contactToEmail = { name, email, emailManufacturer, productName };

    if (!name || !email || !emailManufacturer || !productName) {
      showStatusMessage("error", "Please fill all the fields");
      return;
    }

    const emailMessage = messageManagement(
      contactToEmail,
      "Product Manufacturer"
    );
    handleSendEmails(emailMessage, contactToEmail);

    setName("");
    setEmail("");
    setEmailManufacturer("");
    setProductName("");
  };

  const breadcrumbs = [
    { href: "/", name: "Home" },
    { name: "Manufacturer Form" },
  ];

  return (
    <Layout title='Manufacturer Form'>
      <nav className='text-sm text-gray-700 ml-auto'>
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
      <div className='max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 my-5'>
        <h3 className='text-xl text-center font-semibold text-[#0e355e] mb-6'>
          For the most accurate quote, please provide us with a list that
          includes reference numbers, quantities(each/box), and expiration
          dating.
        </h3>
        <form ref={form} onSubmit={sendEmail} className='space-y-6'>
          <div>
            <label className='block text-[#0e355e] mb-2'>Name*</label>
            <input
              autoComplete='off'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className='w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#144e8b]'
            />
          </div>
          <div>
            <label className='block text-[#0e355e] mb-2'>Email*</label>
            <input
              autoComplete='off'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#144e8b]'
            />
          </div>
          <div>
            <label className='block text-[#0e355e] mb-2'>Product Name*</label>
            <input
              autoComplete='off'
              type='text'
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className='w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#144e8b]'
            />
          </div>
          <div>
            <label className='block text-[#0e355e] mb-2'>Manufacturer*</label>
            <input
              autoComplete='off'
              type='text'
              value={emailManufacturer}
              onChange={(e) => setEmailManufacturer(e.target.value)}
              required
              className='w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#144e8b]'
            />
          </div>
          <button
            type='submit'
            className='w-full bg-[#144e8b] hover:bg-[#788b9b] text-white py-3 rounded-lg flex items-center justify-center gap-2'
          >
            Send
            <BiMessageAdd />
          </button>
        </form>
      </div>
    </Layout>
  );
}
