import React from "react";
import {
  FaFacebookF,
  FaMapMarkerAlt,
  FaLinkedinIn,
  FaEnvelope,
} from "react-icons/fa";

export default function Header() {
  return (
    <div className='hidden md:flex bg-white text-[#0e355e] text-sm md:text-lg z-[9999] max-w-7xl mx-auto justify-between items-center px-4'>
      <div className='flex space-x-4'>
        <a
          href='#contact'
          title='Contact STAT Surgical Supply - Request Information'
          className='hover:underline'
        >
          Contact Us
        </a>
        <span>|</span>
        <p>Stat Surgical Supply - The supplies you need, STAT.</p>
      </div>

      <div className='flex space-x-4 items-center'>
        <a
          href='https://www.facebook.com/statsurgicalsupply'
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Visit our Facebook page'
          title='Follow STAT Surgical Supply on Facebook'
          className='hover:text-gray-400'
        >
          <FaFacebookF />
        </a>
        <a
          href='mailto:sales@statsurgicalsupply.com'
          title='Email STAT Surgical Supply Sales Department'
          aria-label='Send an email to sales@statsurgicalsupply.com'
          className='hover:text-gray-400'
        >
          <FaEnvelope />
        </a>
        <a
          href='https://www.linkedin.com/company/statsurgicalsupply'
          target='_blank'
          title='Follow STAT Surgical Supply on LinkedIn'
          rel='Visit our LinkedIn profile'
          aria-label='Visit our Facebook page'
          className='hover:text-gray-400'
        >
          <FaLinkedinIn />
        </a>
        <a
          href='https://www.google.com/maps/place/100+Ashley+Dr+S+%23600,+Tampa,+FL+33602,+EE.+UU./@27.9446387,-82.4577838,581m/data=!3m2!1e3!4b1!4m6!3m5!1s0x88c2c48c390490ab:0x202198cbac670f1a!8m2!3d27.9446387!4d-82.4577838!16s%2Fg%2F11q_6clqzb?entry=ttu&g_ep=EgoyMDI1MDMzMS4wIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D'
          target='_blank'
          rel='noopener noreferrer'
          title='See STAT Surgical Supply on Google Maps'
          aria-label='See our location on Google Maps'
          className='hover:text-gray-400'
        >
          <FaMapMarkerAlt />
        </a>
        <span>|</span>
        <a
          href='tel:+18136074110'
          title='Call STAT Surgical Supply - Main Line'
          className='hover:underline'
        >
          (813) 252-0727
        </a>
      </div>
    </div>
  );
}
