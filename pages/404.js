import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "../components/main/Layout";

export default function Custom404() {
  return (
    <Layout>
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center p-10 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md'
        >
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className='text-5xl font-bold text-[#144e8b]'
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='mt-4 text-xl font-semibold text-[#03793d]'
          >
            Page Not Found
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='mt-2 text-[#414b53]'
          >
            The page you are looking for might have been moved or does not
            exist.
          </motion.p>

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
