import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Inline SVG icons — eliminates react-icons/fa and framer-motion from the
// shared Layout bundle, saving ~50 KB gzipped on every page.
function HandsHelpingIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 640 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M488 192H336l56.7-56.7c-5-15.7-19.2-27.3-36.1-27.3h-64c-3.4 0-6.6 1.1-9.4 3.1L217 176H96v128h48v-24h32l120 96v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32v-16h32c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32z' />
    </svg>
  );
}

function BoxOpenIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 640 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M425.7 256c-16.9 0-32.8-9-41.4-23.4L320 126l-64.2 106.6c-8.7 14.5-24.6 23.5-41.5 23.5-4.5 0-9-.6-13.3-1.9L64 215v178c0 14.7 10 27.5 24.2 31l216.2 54.1c10.2 2.5 20.9 2.5 31 0L551.8 424c14.2-3.6 24.2-16.4 24.2-31V215l-137 39.1c-4.3 1.3-8.8 1.9-13.3 1.9zm212.6-112.2L586.8 41c-3.1-6.2-9.8-9.8-16.7-8.9l-71 11.1 90.2 136.3c3.8 5.7 10.2 8.9 16.8 8.9 2.3 0 4.7-.4 7-1.2 8-3 12.9-11.3 10.2-19.7zM1.7 143.8l51.5-102.8c3.1-6.2 9.8-9.8 16.7-8.9l71 11.1L50.7 179.5c-3.8 5.7-10.2 8.9-16.8 8.9-2.3 0-4.7-.4-7-1.2-8-3-12.9-11.3-10.2-19.7z' />
    </svg>
  );
}

const messages = [
  {
    text: "Welcome to Stat Surgical Supply!",
    Icon: HandsHelpingIcon,
  },
  {
    text: "We focus on top manufacturers to bring you the best products!",
    Icon: BoxOpenIcon,
  },
];

const StaticHeader = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 300);
      return () => clearTimeout(t);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (pathname !== "/products") return null;

  const { Icon, text } = messages[currentMessageIndex];

  return (
    <div className='bg-gray-50 z-10 text-[#0e355e] text-center py-1 text-lg font-semibold justify-center items-center gap-1 hidden md:flex'>
      <div
        className='flex items-center gap-2'
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <Icon className='text-xl text-[#0e355e] mr-2' />
        <span>{text}</span>
      </div>
    </div>
  );
};

export default StaticHeader;
