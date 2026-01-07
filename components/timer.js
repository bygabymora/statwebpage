import { FaClock, FaTruck } from "react-icons/fa";
import moment from "moment-timezone";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ShippingCutoffTimer() {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const nowTampa = moment.tz("America/New_York");
      const cutoff = nowTampa.clone().hour(15).minute(30).second(0);
      const midnight = nowTampa.clone().add(1, "day").startOf("day");

      if (nowTampa.isBefore(cutoff)) {
        const diff = moment.duration(cutoff.diff(nowTampa));
        const hours = Math.floor(diff.asHours());
        const minutes = diff.minutes();
        const seconds = diff.seconds();

        setTimeRemaining({ hours, minutes, seconds });
        setShowTimer(true);
      } else if (nowTampa.isBefore(midnight)) {
        setShowTimer(false);
      } else {
        setShowTimer(false);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!showTimer || !timeRemaining) {
    return null;
  }

  return (
    <motion.section
      className='w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 text-[#0e355e] py-6 px-4 sm:px-6 lg:px-8 shadow-lg -mt-2'
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0'>
          {/* Left Side - Message */}
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <FaClock className='text-3xl text-[#03793d] animate-pulse drop-shadow-sm' />
              <div className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping'></div>
            </div>
            <div>
              <h3 className='text-lg font-bold mb-1'>
                Next-Day Delivery Available!
              </h3>
              <p className='text-sm opacity-90'>
                Get your medical supplies by tomorrow
              </p>
            </div>
          </div>

          {/* Center - Timer */}
          <div className='flex flex-col items-center space-y-2'>
            <span className='text-sm font-medium opacity-90'>
              Order within:
            </span>
            <div className='flex items-center space-x-3'>
              <motion.div
                className='bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-30 px-4 py-2 rounded-xl text-center min-w-[60px] shadow-lg'
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className='text-xl font-bold text-[#0e355e]'>
                  {timeRemaining.hours.toString().padStart(2, "0")}
                </div>
                <div className='text-xs opacity-80'>HOURS</div>
              </motion.div>

              <span className='text-2xl font-bold opacity-60'>:</span>

              <motion.div
                className='bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-30 px-4 py-2 rounded-xl text-center min-w-[60px] shadow-lg'
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <div className='text-xl font-bold text-[#0e355e]'>
                  {timeRemaining.minutes.toString().padStart(2, "0")}
                </div>
                <div className='text-xs opacity-80'>MIN</div>
              </motion.div>

              <span className='text-2xl font-bold opacity-60'>:</span>

              <motion.div
                className='bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-30 px-4 py-2 rounded-xl text-center min-w-[60px] shadow-lg'
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <div className='text-xl font-bold text-[#0e355e]'>
                  {timeRemaining.seconds.toString().padStart(2, "0")}
                </div>
                <div className='text-xs opacity-80'>SEC</div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - CTA */}
          <div className='flex items-center space-x-4'>
            <div className='text-center lg:text-right'>
              <p className='text-sm font-medium mb-1'>Fast & Reliable</p>
              <div className='flex items-center space-x-2 text-[#03793d]'>
                <FaTruck className='text-xl drop-shadow-sm' />
                <span className='text-sm font-medium'>Overnight Shipping</span>
              </div>
            </div>
            <motion.button
              className='bg-[#03793d] hover:bg-[#025a2d] text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 whitespace-nowrap'
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/products")}
            >
              Shop Now
            </motion.button>
          </div>
        </div>

        {/* Bottom Message */}
        <div className='text-center mt-4 pt-4 border-t border-white border-opacity-20'>
          <p className='text-sm opacity-90'>
            <span className='font-semibold text-[#03793d]'>
              Want it by tomorrow?
            </span>{" "}
            Complete your order within the next {timeRemaining.hours} hours and{" "}
            {timeRemaining.minutes} minutes, then select overnight shipping at
            checkout.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
