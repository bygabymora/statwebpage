"use client";

import React from "react";

export default function LocationMap() {
  return (
    <section className='mb-16'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
          Find Our Location
        </h2>
        <p className='text-lg text-gray-600'>
          Located in the heart of Tampa, Florida
        </p>
      </div>

      <div className='rounded-2xl overflow-hidden shadow-2xl border-4 border-[#144e8b]'>
        <iframe
          src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d881.1556225029047!2d-82.45766380676294!3d27.944216161107967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c59877a39355%3A0xd495507c20fbd5f0!2sStat%20Surgical%20Supply!5e0!3m2!1sen!2sco!4v1748536969142!5m2!1sen!2sco'
          className='w-full h-96 lg:h-[500px]'
          allowFullScreen
          title='Stat Surgical Supply Location Map'
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
        />
      </div>
    </section>
  );
}
