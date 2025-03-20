import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const messages = [
  "Welcome to Stat Surgical Supply!",
  "We work with top manufacturers to bring you the best products!",
];

const StaticHeader = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const pathname = usePathname();
  
  if (pathname !== "/products") return null;


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#f5f5f5fb] text-[#144e8b] text-center py-2 text-lg font-semibold">
      {messages[currentMessageIndex]}
    </div>
  );
};

export default StaticHeader;