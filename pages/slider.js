import React from "react";
import { FaBoxOpen, FaCheckCircle, FaDollarSign, FaHeadset } from "react-icons/fa";

const benefits = [
  {
    title: "Stock Available",
    description: "Equipment ready for immediate shipment.",
    icon: <FaBoxOpen className="text-4xl text-[#03793d]" />,
  },
  {
    title: "High Quality",
    description: "Guaranteed medical certification.",
    icon: <FaCheckCircle className="text-4xl text-[#03793d]" />,
  },
  {
    title: "Competitive Prices",
    description: "Save without compromising quality.",
    icon: <FaDollarSign className="text-4xl text-[#03793d]" />,
  },
  {
    title: "Specialized Support",
    description: "Care for hospitals and clinics.",
    icon: <FaHeadset className="text-4xl text-[#03793d]" />,
  }
];

export default function Benefits() {
  return (
    <section className="w-full">
      <h2 className="text-3xl font-bold text-center text-[#144e8b]">Why choose us?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center p-6 bg-white rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
            {benefit.icon}
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-[#144e8b]">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}