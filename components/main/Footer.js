import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from './../../public/images/assets/logo2.png';
import linkedIn from './../../public/images/assets/linkedIn.svg';
import facebook from './../../public/images/assets/facebook.svg';
import Google from './../../public/images/assets/Google.svg';
import Payment from './../../public/images/assets/payments.png';
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
            <Link href="/return-policy">Return Policy</Link>
            <Link href="/terms-of-use">Terms of Use</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
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
          <div className="flex flex-col items-center">
            <Image
              className="footer-logo hidden lg:block"
              src={Logo}
              alt="STAT Logo"
              width={300}
              height={100}
            />
            <div className="font-bold footer-copyright ml-4">
              <p>&copy; 2023 STAT Surgical Supply. All rights reserved.</p>
            </div>
          </div>
        </div>
        <Image
          className="footer-logo self-end sm:mr-3 sm:mb-3"
          src={Payment}
          alt="Payment Methods"
          width={300}
          height={'auto'}
        />
        <br />
        <div className="flex flex-row">
          <Link
            target="_blank"
            href="https://www.linkedin.com/company/statsurgicalsupply"
          >
            <Image
              className="footer-logo lg:block"
              src={linkedIn}
              alt="Linkedin Logo"
              width={50}
              height={50}
            />
          </Link>
          <Link
            href="https://www.facebook.com/statsurgicalsupply"
            target="_blank"
          >
            <Image
              className="footer-logo lg:block"
              src={facebook}
              alt="Facebook Logo"
              width={50}
              height={50}
            />
          </Link>
          <Link
            target="_blank"
            href="https://www.google.com/search?client=ms-android-samsung-rvo1&sca_esv=576236845&hl=es-US&cs=0&sxsrf=AM9HkKl1tpL3nUX-DjSFoU6UOamEFuZhXg:1698186565938&q=Stat+Surgical+Supply&ludocid=15318238201630152176&ibp=gwp;0,7&lsig=AB86z5Vgj89yReXI6YGJA4xeQsis&kgs=731d10de23055d4c&shndl=-1&shem=lbsc,lsp&source=sh/x/loc/act/m1/4"
          >
            <Image
              className="footer-logo lg:block"
              src={Google}
              alt="Google Logo"
              width={50}
              height={50}
            />
          </Link>
        </div>
        <br />
      </div>
    </footer>
  );
}
