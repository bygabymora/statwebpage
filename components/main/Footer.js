import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "./../../public/images/assets/logo2.png";
import linkedIn from "./../../public/images/assets/linkedIn.svg";
import facebook from "./../../public/images/assets/facebook.svg";
import Google from "./../../public/images/assets/Google.svg";
import Payment from "./../../public/images/assets/payments.png";
import { AiOutlineSend } from "react-icons/ai";
import { useEffect, useState, useRef } from "react";
import { useModalContext } from "../context/ModalContext";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";

export default function Footer() {
  const formRef = useRef();
  const { showStatusMessage, user } = useModalContext();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.isApproved) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const sendEmail = (e) => {
    e.preventDefault();

    if (!email) {
      showStatusMessage("error", "Please enter your email");
      return;
    }

    const contactToEmail = { name, email };
    const emailmessage = messageManagement(
      contactToEmail,
      "Newsletter Subscription"
    );

    handleSendEmails(emailmessage, contactToEmail);

    setEmail("");
    if (!user?.isApproved) setName(""); //  Clear name only if user is not authenticated
  };

  return (
    <footer
      className='relative flex flex-col items-center shadow-inner min-h-[400px] justify-center footer'
      style={{ height: "auto", minHeight: "400px" }}
    >
      <div className='footer-container'>
        <section className='footer-links'>
          <div className='footer-linkGroup flex flex-col m-5'>
            <h4>
              <Link className='font-bold' href='/products'>
                Products
              </Link>
            </h4>
            <Link href='/products'>All products</Link>
          </div>
          <div className='footer-linkGroup flex flex-col m-5'>
            <h4 className='font-bold'>Company</h4>
            <Link href='/about'>About Us</Link>
            <Link
              href='/careers'
              title='Careers'
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "Stat Surgical is not hiring at this time. Please check back with us periodically for updates - we will post positions as they become available"
                );
              }}
            >
              Careers
            </Link>
            <Link href='/#contact'>Contact</Link>
          </div>
          <div className='footer-linkGroup flex flex-col m-5'>
            <h4 className='font-bold'>Support</h4>
            <Link href='/faqs'>FAQs</Link>
            <Link href='/return-policy' title='View our return policy'>
              Return Policy
            </Link>
            <Link href='/terms-of-use'>Terms of Use</Link>
            <Link href='/privacy-policy' prefetch={false}>
              Privacy Policy
            </Link>
          </div>
        </section>
      </div>
      <br />
      <h3 className='font-bold'>Sell us your products today!</h3>
      <Link
        className='flex justify-center items-center'
        href='/ManufacturerForm'
      >
        <span className='banner-link'>Send us your list</span>
        <span className='link-space'>&nbsp;&nbsp;</span>
        <AiOutlineSend className='link-space' />
      </Link>
      <br />
      <div className='flex flex-col lg:flex-row items-center justify-between w-full max-w-5xl'>
        <div className='relative w-[300px] h-[100px] invisible lg:visible'>
          <Image
            src={Logo}
            alt='STAT Logo'
            title='STAT Surgical Supply Logo'
            fill
            sizes='(min-width:1024px) 300px, 0'
            className='footer-logo invisible lg:visible'
            priority
          />
        </div>
        <div className='flex flex-col items-center w-full max-w-lg px-4 text-center'>
          <h4 className='text-xl font-semibold text-[#144e8b]'>
            Subscribe to our Newsletter
          </h4>
          <form
            className='w-full flex flex-col sm:flex-row gap-2 mt-4'
            ref={formRef}
            onSubmit={sendEmail}
          >
            <input
              autoComplete='off'
              type='text'
              placeholder='Name'
              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#144e8b] disabled:bg-gray-100'
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!user?.isApproved}
            />
            <input
              autoComplete='off'
              type='email'
              placeholder='Email'
              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type='submit'
              className='px-6 py-2 bg-[#03793d] text-white font-medium rounded-lg hover:bg-[#025e2d] transition'
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className='flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mt-6'>
        <div className='text-center sm:text-left font-bold'>
          <p className='text-[#144e8b]'>Email: sales@statsurgicalsupply.com</p>
          <p className='text-[#144e8b]'>Phone: (813) 252-0727</p>
        </div>
        <br />
        <div className='relative w-[300px] h-[113px] self-end sm:mr-3 sm:mb-3'>
          <Image
            src={Payment}
            alt='Payment Methods'
            title='Payment Methods'
            fill
            sizes='300px'
            className='object-contain'
            loading='lazy'
            placeholder='blur'
          />
        </div>
        <div className='flex space-x-4 mt-4 sm:mt-0'>
          <div className='relative w-[50px] h-[50px] '>
            <Link
              target='_blank'
              href='https://www.linkedin.com/company/statsurgicalsupply'
            >
              <Image
                src={linkedIn}
                alt='Linkedin Logo'
                title='Linkedin Logo'
                fill
                sizes='50px'
                loading='lazy'
                className='footer-logo lg:block'
              />
            </Link>
          </div>
          <div className='relative w-[50px] h-[50px]'>
            <Link
              href='https://www.facebook.com/statsurgicalsupply'
              target='_blank'
            >
              <Image
                src={facebook}
                alt='Facebook Logo'
                title='Facebook Logo'
                fill
                sizes='50px'
                loading='lazy'
                className='footer-logo lg:block'
              />
            </Link>
          </div>
          <div className='relative w-[50px] h-[50px]'>
            <Link
              target='_blank'
              href='https://www.google.com/search?client=ms-android-samsung-rvo1&sca_esv=576236845&hl=es-US&cs=0&sxsrf=AM9HkKl1tpL3nUX-DjSFoU6UOamEFuZhXg:1698186565938&q=Stat+Surgical+Supply&ludocid=15318238201630152176&ibp=gwp;0,7&lsig=AB86z5Vgj89yReXI6YGJA4xeQsis&kgs=731d10de23055d4c&shndl=-1&shem=lbsc,lsp&source=sh/x/loc/act/m1/4'
            >
              <Image
                src={Google}
                alt='Google Logo'
                title='Google Logo'
                fill
                sizes='50px'
                loading='lazy'
                className='footer-logo lg:block'
              />
            </Link>
          </div>
        </div>
      </div>
      <div className='w-full'>
        <hr className='border-t border-[#788b9b] mt-4' />
        <div className='font-bold footer-copyright ml-4'>
          &copy; {new Date().getFullYear()} STAT Surgical Supply. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
