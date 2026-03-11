// Critical hero content — inline SVGs eliminate react-icons/fa from this chunk
import React from "react";

function HeadsetIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 512 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M192 208c0-17.67-14.33-32-32-32h-16c-35.35 0-64 28.65-64 64v48c0 35.35 28.65 64 64 64h16c17.67 0 32-14.33 32-32V208zm176 144c35.35 0 64-28.65 64-64v-48c0-35.35-28.65-64-64-64h-16c-17.67 0-32 14.33-32 32v112c0 17.67 14.33 32 32 32h16zM256 0C113.18 0 4.58 118.83 0 256v16c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16v-16c0-114.69 93.31-208 208-208s208 93.31 208 208h-.12c.08 2.43.12 165.72.12 165.72 0 23.35-18.93 42.28-42.28 42.28H320c0-26.51-21.49-48-48-48h-32c-26.51 0-48 21.49-48 48s21.49 48 48 48h181.72C492.72 512 544 460.72 544 389.72V256C539.42 118.83 430.82 0 256 0z' />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 512 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48c-10.7 4.7-16.6 16.3-14 27.6l24 104C26.2 504.2 36 512 47.9 512 256.2 512 512 256.3 512 47.9c0-11.9-7.8-21.8-18.6-23.3z' />
    </svg>
  );
}

function EnvelopeIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 512 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z' />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className='bg-gray-100 text-gray-900 py-16 px-6 mb-12 rounded-xl mx-4 lg:mx-20 my-5'>
      <div className='max-w-4xl mx-auto text-center'>
        {/* Simple placeholder for icon - will be enhanced by client component */}
        <div className='inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6'>
          <HeadsetIcon className='text-4xl text-[#0e355e]' />
        </div>
        <h1 className='text-4xl lg:text-5xl font-bold mb-4'>
          Professional Customer Support
        </h1>
        <h2 className='text-xl lg:text-2xl font-light mb-6 text-[#0e355e]'>
          Expert assistance for surgical professionals
        </h2>
        {/* LCP Element - Critical paragraph */}
        <p className='text-lg leading-relaxed max-w-3xl mx-auto text-[#0e355e]'>
          Need assistance with your surgical supply order or product questions?
          Our dedicated support team is here to help surgical professionals like
          you with personalized service and expert guidance.
        </p>
        {/* Simple CTA without icons initially */}
        <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
          <a
            href='tel:+18132520727'
            className='inline-flex items-center px-8 py-3 bg-white text-[#144e8b] font-semibold rounded-lg hover:bg-blue-100 transition-colors shadow-lg'
          >
            <PhoneIcon className='mr-2' />
            Call Now: (813) 252-0727
          </a>
          <a
            href='mailto:centralsales@statsurgicalsupply.com'
            className='inline-flex items-center px-8 py-3 bg-transparent border-2 border-[#144e8b] text-[#144e8b]
              font-semibold rounded-lg hover:bg-white hover:text-[#144e8b] transition-all'
          >
            <EnvelopeIcon className='mr-2' />
            Send Email
          </a>
        </div>
      </div>
    </section>
  );
}
