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
import CustomAlertModal from "./CustomAlertModal";

export default function Footer() {
  const formRef = useRef();
  const { showStatusMessage, user } = useModalContext();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const alertMessage = {
    title: "We're not hiring right now",
    body: "Stat Surgical Supply is not hiring at this time.",
    warning: "Please check back with us periodically for updates.",
  };

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
    if (!user?.isApproved) setName(""); // Clear name only if user is not authenticated
  };

  return (
    <footer
      className='relative flex flex-col items-center shadow-inner min-h-[400px] footer w-full justify-between px-4 py-8 md:min-h-[560px] lg:min-h-[480px]'
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
            <div className='flex items-center'>
              <button
                className='text-[#0e355e]'
                title='Careers'
                onClick={() => setIsAlertOpen(true)}
              >
                Careers
              </button>

              <CustomAlertModal
                isOpen={isAlertOpen}
                message={alertMessage}
                onConfirm={() => setIsAlertOpen(false)}
              />
            </div>
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
        title='Send us your list'
        href='/ManufacturerForm'
      >
        <span className='banner-link'>Send us your list</span>
        <span className='link-space'>&nbsp;&nbsp;</span>
        <AiOutlineSend className='link-space' />
      </Link>
      <br />
      <div className='flex flex-col lg:flex-row items-center justify-between w-full max-w-5xl'>
        <Image
          className='footer-logo hidden lg:block'
          src={Logo}
          alt='STAT Surgical Supply Main Logo'
          title='Medical Equipment for Professionals | Wholesale by STAT'
          loading='lazy'
          width={300}
          height={100}
        />
        <div className='flex flex-col items-center w-full max-w-lg px-4 text-center'>
          <h4 className='text-xl font-semibold text-[#0e355e]'>
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
          <p className='text-[#0e355e]'>Email: sales@statsurgicalsupply.com</p>
          <p className='text-[#0e355e]'>Phone: (813) 252-0727</p>
        </div>
        <br />
        <Image
          className='footer-logo self-end sm:mr-3 sm:mb-3'
          src={Payment}
          alt='Accepted Payment Methods - Credit Card, PayPal, Bank Transfer'
          title='Payment Options for types Equipment Purchases'
          width={300}
          height={69}
          loading='lazy'
        />
        <div className='flex space-x-4 mt-4 sm:mt-0'>
          <Link
            target='_blank'
            href='https://www.linkedin.com/company/statsurgicalsupply'
          >
            <Image
              className='footer-logo lg:block'
              src={linkedIn}
              alt='STAT Surgical Supply LinkedIn Page'
              title='Follow STAT Surgical Supply on LinkedIn'
              width={50}
              height={50}
              loading='lazy'
            />
          </Link>
          <Link
            href='https://www.facebook.com/statsurgicalsupply'
            target='_blank'
          >
            <Image
              className='footer-logo lg:block'
              src={facebook}
              alt='STAT Surgical Supply Facebook Profile'
              title='Visit STAT Surgical Supply on Facebook'
              width={50}
              height={50}
              loading='lazy'
            />
          </Link>
          <Link
            target='_blank'
            title='STAT Surgical Supply - Google Business Profile'
            href='https://www.google.com/search?client=ms-android-samsung-rvo1&sca_esv=576236845&hl=es-US&cs=0&sxsrf=AM9HkKl1tpL3nUX-DjSFoU6UOamEFuZhXg:1698186565938&q=Stat+Surgical+Supply&ludocid=15318238201630152176&ibp=gwp;0,7&lsig=AB86z5Vgj89yReXI6YGJA4xeQsis&kgs=731d10de23055d4c&shndl=-1&shem=lbsc,lsp&source=sh/x/loc/act/m1/4'
          >
            <Image
              className='footer-logo lg:block'
              src={Google}
              alt='STAT Surgical Supply Google Profile'
              title='See STAT Surgical Supply on Google Business Profile'
              width={50}
              height={50}
              loading='lazy'
            />
          </Link>
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
