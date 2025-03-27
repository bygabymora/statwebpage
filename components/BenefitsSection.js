import { FaBoxOpen, FaDollarSign, FaHeadset, FaShieldAlt } from "react-icons/fa";
import Link from 'next/link';

const benefits = [
    { icon: <FaDollarSign />, title: "Guaranteed Savings", description: "Save up to X% on selected products.", link: "/savings" },
    { icon: <FaBoxOpen />, title: "Available Stock", description: "Wide catalog with fast delivery.", link: "/products" },
    { icon: <FaShieldAlt />, title: "Secure Buying & Selling", description: "Reliable and verified processes.", link: "/selling" },
    { icon: <FaHeadset />, title: "Personalized Support", description: "Email, phone, or visit our location.", link: "/support" }
  ];
  
  export default function BenefitsSection() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-8 w-full my-5">
        {benefits.map((benefit, index) => (
          <Link key={index} href={benefit.link} className="group">
            <div className="flex flex-col items-center p-4 bg-[#f8f9fa] rounded-lg shadow-md transition-all transform hover:scale-105 hover:shadow-lg">
              <div className="text-4xl text-[#03793d] transition-all group-hover:rotate-6">{benefit.icon}</div>
              <h4 className="font-bold text-[#144e8b] mt-2">{benefit.title}</h4>
              <p className="text-[#414b53] text-sm text-center">{benefit.description}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  }
   