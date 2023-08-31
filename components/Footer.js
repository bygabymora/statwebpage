import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../public/images/assets/logo2.png';
import Payment from '../public/images/assets/payments.png';
import { AiOutlineSend } from 'react-icons/ai';

export default function Footer() {
  return (
    <footer className="flex h-30 justify-center shadow-inner items-center footer flex-col relative">
      <div className="footer-container">
        <section className="footer-links">
          <div className="footer-linkGroup flex flex-col m-5">
            <h4>
              <Link className="font-bold" href="/products">
                Products
              </Link>
            </h4>
            <Link href="/products">All products</Link>
          </div>
          <div className="footer-linkGroup flex flex-col m-5">
            <h4 className="font-bold">Company</h4>
            <Link href="/about">About Us</Link>
            <Link
              href="/careers"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'Stat Surgical is not hiring at this time. Please check back with us periodically for updates - we will post positions as they become available'
                );
              }}
            >
              Careers
            </Link>
            <Link href="/#contact">Contact</Link>
          </div>
          <div className="footer-linkGroup flex flex-col m-5">
            <h4 className="font-bold">Support</h4>
            <Link href="/faqs">FAQs</Link>
            <Link href="/terms-and-conditions">Shipping & Returns</Link>
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
          </div>
        </section>
      </div>
      <h3 className="font-bold">Sell us your products today!</h3>

      <Link
        className="flex justify-center items-center"
        href="/ManufacturerForm"
      >
        <span className="banner-link">Send us your list</span>
        <span className="link-space">&nbsp;&nbsp;</span>
        <AiOutlineSend className="link-space" />
      </Link>
      <br />

      <div className="flex flex-col sm:flex-row justify-between w-full items-center mt-5 sm:mt-0">
        <div className="flex items-center">
          <Image
            className="footer-logo sm:block hidden md:"
            src={Logo}
            alt="STAT Logo"
            width={300}
            height={100}
          />
          <div className="font-bold footer-copyright ml-4">
            <p>&copy; 2023 STAT Surgical Supply. All rights reserved.</p>
          </div>
        </div>

        <Image
          className="footer-logo self-end sm:mr-3 sm:mb-3"
          src={Payment}
          alt="Payment Methods"
          width={300}
          height={100}
        />
      </div>
    </footer>
  );
}
