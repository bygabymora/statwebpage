import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../public/images/assets/logo2.png';

export default function Footer() {
  return (
    <footer className="footer_1 flex h-30 justify-center shadow-inner items-center footer flex-col">
      <div className="footer-container">
        <section className="footer-links">
          <div className="footer-linkGroup flex flex-col m-5">
            <h4 className="font-bold">Products</h4>
            <Link href="/products">Surgical Instruments</Link>
            <Link href="/products">Disposables</Link>
            <Link href="/products">Orthopedic Supplies</Link>
          </div>
          <div className="footer-linkGroup flex flex-col m-5">
            <h4 className="font-bold">Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/#contact">Contact</Link>
          </div>
          <div className="footer-linkGroup flex flex-col m-5">
            <h4 className="font-bold">Support</h4>
            <Link href="/faqs">FAQs</Link>
            <Link href="/shipping-and-returns">Shipping & Returns</Link>
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
            <Link href="/documentation">Documentation</Link>
          </div>
        </section>
      </div>
      <Image
        className="footer-logo sm:block hidden md:"
        src={Logo}
        alt="STAT Logo"
        width={300}
        height={100}
      />
      <div className="font-bold footer-copyright">
        <p>&copy; 2023 STAT Surgical Supply. All rights reserved.</p>
      </div>
    </footer>
  );
}
