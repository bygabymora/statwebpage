import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaHandsHelping, FaBoxOpen } from "react-icons/fa";

const messages = [
  {
    text: "Welcome to Stat Surgical Supply!",
    icon: (
      <FaHandsHelping className='text-xl text-[#144e8b] animate-bounce mr-2' />
    ),
  },
  {
    text: "We work with top manufacturers to bring you the best products!",
    icon: <FaBoxOpen className='text-xl text-[#144e8b] animate-bounce mr-2' />,
  },
];

const StaticHeader = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (pathname !== "/products") return null;

  return (
    <div className='bg-gray-50 z-10 text-[#144e8b] text-center py-2 text-lg font-semibold justify-center items-center gap-2 hidden md:flex'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentMessageIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
          className='flex items-center gap-2'
        >
          {messages[currentMessageIndex].icon}
          <span>{messages[currentMessageIndex].text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StaticHeader;
