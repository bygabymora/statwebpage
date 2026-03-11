import { useEffect, useState } from "react";
import Link from "next/link";

// Inline SVG icons — eliminates react-icons/fa from this bundle chunk
function ClockIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 512 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8l-18.2 25.1c-3.9 5.3-11.4 6.5-16.8 2.6z' />
    </svg>
  );
}

function TruckIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 640 512'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M624 352h-16V243.9c0-12.7-5.1-24.9-14.1-33.9L494 110.1c-9-9-21.2-14.1-33.9-14.1H416V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48v320c0 26.5 21.5 48 48 48h16c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h48c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM160 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm320 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-208H416V144h44.1l99.9 99.9V256z' />
    </svg>
  );
}

/**
 * Returns { hours, minutes, seconds } in America/New_York timezone.
 * Uses native Intl API — replaces moment-timezone (~300 KB parsed).
 */
function getNewYorkTime() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) =>
    parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
  return { hours: get("hour"), minutes: get("minute"), seconds: get("second") };
}

export default function ShippingCutoffTimer() {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const { hours: h, minutes: m, seconds: s } = getNewYorkTime();
      const nowSec = h * 3600 + m * 60 + s;
      const cutoffSec = 15 * 3600 + 30 * 60; // 3:30 PM ET

      if (nowSec < cutoffSec) {
        const diff = cutoffSec - nowSec;
        setTimeRemaining({
          hours: Math.floor(diff / 3600),
          minutes: Math.floor((diff % 3600) / 60),
          seconds: diff % 60,
        });
        setShowTimer(true);
      } else {
        setShowTimer(false);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!showTimer || !timeRemaining) return null;

  return (
    <section className='w-full min-h-[220px] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 text-[#0e355e] py-6 px-4 sm:px-6 lg:px-8 shadow-lg -mt-2'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0'>
          {/* Left Side - Message */}
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <ClockIcon className='text-3xl text-[#03793d] animate-pulse drop-shadow-sm' />
              <div className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping' />
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

          {/* Center - Timer (CSS pulse replaces framer-motion animate) */}
          <div className='flex flex-col items-center space-y-2'>
            <span className='text-sm font-medium opacity-90'>
              Order within:
            </span>
            <div className='flex items-center space-x-3'>
              <div className='animate-timer-pulse bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-30 px-4 py-2 rounded-xl text-center min-w-[60px] shadow-lg'>
                <div className='text-xl font-bold text-[#0e355e]'>
                  {timeRemaining.hours.toString().padStart(2, "0")}
                </div>
                <div className='text-xs opacity-80'>HOURS</div>
              </div>

              <span className='text-2xl font-bold opacity-60'>:</span>

              <div className='animate-timer-pulse [animation-delay:0.5s] bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-30 px-4 py-2 rounded-xl text-center min-w-[60px] shadow-lg'>
                <div className='text-xl font-bold text-[#0e355e]'>
                  {timeRemaining.minutes.toString().padStart(2, "0")}
                </div>
                <div className='text-xs opacity-80'>MIN</div>
              </div>

              <span className='text-2xl font-bold opacity-60'>:</span>

              <div className='animate-timer-pulse [animation-delay:1s] bg-white bg-opacity-15 backdrop-blur-sm border border-white border-opacity-30 px-4 py-2 rounded-xl text-center min-w-[60px] shadow-lg'>
                <div className='text-xl font-bold text-[#0e355e]'>
                  {timeRemaining.seconds.toString().padStart(2, "0")}
                </div>
                <div className='text-xs opacity-80'>SEC</div>
              </div>
            </div>
          </div>

          {/* Right Side - CTA */}
          <div className='flex items-center space-x-4'>
            <div className='text-center lg:text-right'>
              <p className='text-sm font-medium mb-1'>Fast &amp; Reliable</p>
              <div className='flex items-center space-x-2 text-[#03793d]'>
                <TruckIcon className='text-xl drop-shadow-sm' />
                <span className='text-sm font-medium'>Overnight Shipping</span>
              </div>
            </div>
            <Link
              href='/products'
              className='bg-[#03793d] hover:bg-[#025a2d] hover:scale-105 hover:-translate-y-px active:scale-95 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 whitespace-nowrap'
            >
              Shop Now
            </Link>
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
    </section>
  );
}
