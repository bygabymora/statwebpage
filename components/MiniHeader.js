import React from "react";
import { FaFacebookF, FaMapMarkerAlt, FaLinkedinIn, FaEnvelope } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-white text-[#144e8b] text-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">
 
        <div className="flex space-x-4">
          <a href="#contact" className="hover:underline">Contact Us</a>
          <span>|</span>
          <p>Stat Surgical Supply Reliable, Affordable, High Quality Surgical Tools.</p>
        </div>

        <div className="flex space-x-4 items-center">
          <a href="https://www.facebook.com/statsurgicalsupply" className="hover:text-gray-400"><FaFacebookF /></a>
          <a href="mailto:sales@statsurgicalsupply.com" className="hover:text-gray-400"><FaEnvelope /></a>
          <a href="https://www.google.com/maps/place/100+Ashley+Dr+S+%23600,+Tampa,+FL+33602,+EE.+UU./@27.9446387,-82.4577838,581m/data=!3m2!1e3!4b1!4m6!3m5!1s0x88c2c48c390490ab:0x202198cbac670f1a!8m2!3d27.9446387!4d-82.4577838!16s%2Fg%2F11q_6clqzb?entry=ttu&g_ep=EgoyMDI1MDMzMS4wIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D" 
             className="hover:text-gray-400"><FaMapMarkerAlt />
          </a>
          <a href="https://www.linkedin.com/company/statsurgicalsupply" className="hover:text-gray-400"><FaLinkedinIn /></a>
          <span>|</span>
          <a href="tel:+18136074110" className="hover:underline">(813) 607-4110</a>
        </div>
      </div>
      <div className="border-b border-gray-300"></div>
    </header>
  );
}