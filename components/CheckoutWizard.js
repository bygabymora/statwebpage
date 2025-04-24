import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function CheckoutWizard({ activeStep = 0 }) {
  const steps = [
    "User Login",
    "Shipping Address",
    "Payment Method",
    "Confirm Order",
  ];

  return (
    <div className='mb-8 flex items-center justify-center relative'>
      <div className='absolute top-1/2 left-0 w-full h-1 bg-gray-300 -translate-y-1/2'></div>
      {steps.map((step, index) => (
        <div
          key={step}
          className='relative z-10 flex flex-col items-center flex-1'
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: index <= activeStep ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold 
            ${index <= activeStep ? "bg-[#03793d] shadow-lg" : "bg-gray-400"}`}
          >
            {index < activeStep ? (
              <CheckCircleIcon className='w-6 h-6 text-white' />
            ) : (
              index + 1
            )}
          </motion.div>
          <p
            className={`mt-2 text-sm font-semibold ${
              index <= activeStep ? "text-green-700" : "text-gray-500"
            }`}
          >
            {step}
          </p>
        </div>
      ))}
    </div>
  );
}
