import Link from 'next/link';
import React from 'react';
import { AiOutlineSend } from 'react-icons/ai';

const StaticBanner = () => {
  return (
    <div className="static-banner-container mt-4">
      <div className="banner-content">
        <h2 className="banner-title">
          Partner With Us and Sell Your Surgical Disposables
        </h2>
        <p className="banner-description">
          Stat Surgical Supply is looking to fill our customer demand. We pay
          top dollar for in-date high-end surgical disposables.
        </p>
        <Link
          className="flex justify-center items-center"
          href="/ManufacturerForm"
        >
          <span className="banner-link">Send us your list</span>
          <span className="link-space">&nbsp;&nbsp;</span>
          <AiOutlineSend className="link-space" />
        </Link>
      </div>
    </div>
  );
};

export default StaticBanner;
