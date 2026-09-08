import React from "react";

// Shared copy so the disclaimer stays consistent across every surface it appears on.
const AvailabilityNotice = ({ className = "" }) => (
  <p className={`text-xs text-gray-500 ${className}`}>
    Quantities and pricing shown are subject to availability at the time your
    order is processed. We will contact you if any item needs to be adjusted.
  </p>
);

export default AvailabilityNotice;
