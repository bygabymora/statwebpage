import React from "react";

// Inline SVG icons — eliminates react-icons/fa from shared header chunk
function FacebookIcon() {
  return (
    <svg
      viewBox='0 0 320 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.8 0 29.4.2 47.6 3l6.2-95.9C304 .4 282 0 244.4 0c-97.2 0-164.4 59.2-164.4 166.6V201.5H0v97.8h80z' />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      viewBox='0 0 512 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z' />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox='0 0 448 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.83-48.3 94 0 111.28 61.9 111.28 142.3V448z' />
    </svg>
  );
}

function MapMarkerIcon() {
  return (
    <svg
      viewBox='0 0 384 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z' />
    </svg>
  );
}

export default function Header() {
  return (
    <div className='hidden md:block bg-[#0e355e] text-white text-sm'>
      <div className='max-w-7xl mx-auto flex justify-between items-center px-4 py-1.5'>
        <div className='flex items-center space-x-3'>
          <a
            href='#contact'
            title='Contact Our Team | Surgical Supplies products in Tampa'
            className='hover:text-green-300 transition-colors'
          >
            Contact Us
          </a>
          <span className='text-white/30'>|</span>
          <p className='text-white/80'>The supplies you need, STAT.</p>
        </div>

        <div className='flex space-x-3 items-center'>
          <a
            href='https://www.facebook.com/statsurgicalsupply'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Visit our Facebook page'
            title='Connect with Us on Facebook | Trusted Healthcare Equipment'
            className='hover:text-green-300 transition-colors'
          >
            <FacebookIcon />
          </a>
          <a
            href='mailto:sales@statsurgicalsupply.com'
            title='Email Our Sales Department | supplies Products'
            aria-label='Send an email to sales@statsurgicalsupply.com'
            className='hover:text-green-300 transition-colors'
          >
            <EnvelopeIcon />
          </a>
          <a
            href='https://www.linkedin.com/company/statsurgicalsupply'
            target='_blank'
            title='Follow Us on LinkedIn | Healthcare Innovation & Solutions'
            rel='noopener noreferrer'
            aria-label='Visit our LinkedIn page'
            className='hover:text-green-300 transition-colors'
          >
            <LinkedInIcon />
          </a>
          <a
            href='https://www.google.com/maps/place/100+Ashley+Dr+S+%23600,+Tampa,+FL+33602,+EE.+UU./@27.9446387,-82.4577838,581m/data=!3m2!1e3!4b1!4m6!3m5!1s0x88c2c48c390490ab:0x202198cbac670f1a!8m2!3d27.9446387!4d-82.4577838!16s%2Fg%2F11q_6clqzb?entry=ttu&g_ep=EgoyMDI1MDMzMS4wIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D'
            target='_blank'
            rel='noopener noreferrer'
            title='Find Us on Google Maps | Surgical Supply Store in Tampa'
            aria-label='See our location on Google Maps'
            className='hover:text-green-300 transition-colors'
          >
            <MapMarkerIcon />
          </a>
          <span className='text-white/30'>|</span>
          <a
            href='tel:+18132520727'
            title='Call Our Main Office | Experts in Surgical Supplies'
            className='hover:text-green-300 transition-colors font-medium'
          >
            (813) 252-0727
          </a>
        </div>
      </div>
    </div>
  );
}
