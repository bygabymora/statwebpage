import Link from 'next/link';
import React from 'react';
import { AiOutlineSend } from 'react-icons/ai';

const StaticBanner = () => {
  return (
    <div className="static-banner-container mt-4">
      <div className="banner-content">
        <h2 className="banner-title">Join Our Network of Manufacturers</h2>
        <p className="banner-description">
          Partner with us to deliver safe, ethical, and high-quality products to
          hospitals and surgery centers. Maximize your reach and increase your
          revenue by working with STAT Surgical Supplies.
        </p>
        <Link
          className="flex justify-center items-center"
          href="/ManufacturerForm"
        >
          <span className="banner-link">Send us your product listing</span>
          <span className="link-space">&nbsp;&nbsp;</span>
          <AiOutlineSend className="link-space" />
        </Link>
      </div>
    </div>
  );
};

export default StaticBanner;
