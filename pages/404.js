import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "../components/main/Layout";
import Lottie from "lottie-react";
import animationData from "../public/404-Ilustration.json";

export default function Custom404() {
  return (
    <Layout>
      <div className='min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 -mt-9'>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center p-5 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md'
        >
          <h1 className='text-5xl font-bold text-[#144e8b] my-5'>404</h1>
          <div className='flex justify-center '>
            <Lottie
              animationData={animationData}
              loop={true}
              style={{
                width: 220,
                height: 220,
                filter: "hue-rotate(15deg) saturate(70%)",
              }}
            />
          </div>
          <p className='text-xl font-bold text-[#03793d]'>Page Not Found</p>
          <p className='mt-2 text-[#414b53]'>
            The page you are looking for might have been moved or does not
            exist.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              href='/'
              className='mt-6 inline-block px-6 py-3 text-white bg-[#144e8b] rounded-xl shadow hover:bg-[#03793d] transition'
            >
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
