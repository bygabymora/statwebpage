import React from "react";
import ContactUs from "./ContactUs";
import { BiArrowFromLeft } from "react-icons/bi";
import Link from "next/link";
import { motion } from "framer-motion";

const Contact = () => {
  const handleCallButtonClick = (event) => {
    event.preventDefault();
    if (window.innerWidth >= 400) {
      alert("Our phone number: 813-252-0727");
    } else {
      window.location.href = "tel:8132520727";
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className='contact min-h-[534px]' id='contact'>
      <div className='contact__container'>
        <h2 className='section__title my-10'>Contact us!</h2>
        <div className='contact__container grid'>
          <div className='contact__content space-y-1.5'>
            <motion.div
              className='contact__card bg-white shadow-lg rounded-lg p-6'
              initial='hidden'
              whileInView='visible'
              variants={cardVariants}
              viewport={{ once: true }}
              layout='position'
            >
              <div className=''>
                <h2 className='contact__card-title'>Address</h2>
                <Link
                  title='Visit STAT Surgical Supply Office - Tampa, FL'
                  className='contact__card-data'
                  href='https://www.google.com/maps/place/100+Ashley+Dr+S+%23600,+Tampa,+FL+33602,+EE.+UU./@27.9446387,-82.4577838,17z/data=!3m1!4b1!4m6!3m5!1s0x88c2c48c390490ab:0x202198cbac670f1a!8m2!3d27.9446387!4d-82.4577838!16s%2Fg%2F11q_6clqzb?entry=ttu'
                  target='_blank'
                >
                  100 South Ashley Drive, Suite 600, Tampa, FL 33602
                </Link>
              </div>
            </motion.div>
            <motion.div
              className='contact__card bg-white shadow-lg rounded-lg p-6'
              initial='hidden'
              whileInView='visible'
              variants={cardVariants}
              viewport={{ once: true }}
              layout='position'
            >
              <div className=''>
                <h2 className='contact__card-title'>Phone</h2>
                <h3 className='contact__card-data'>813-252-0727 </h3>
                <a
                  href='tel:8132520727'
                  onClick={handleCallButtonClick}
                  title='Call STAT Surgical Supply - Sales Support'
                  className='contact__button'
                  target='_blank'
                >
                  Call us! <BiArrowFromLeft />
                </a>
              </div>
            </motion.div>

            <motion.div
              className='contact__card bg-white shadow-lg rounded-lg p-6'
              initial='hidden'
              whileInView='visible'
              variants={cardVariants}
              viewport={{ once: true }}
              layout='position'
            >
              <div className=''>
                <h2 className='contact__card-title'>Fax</h2>
                <h3 className='contact__card-data'>813-607-4110 </h3>
              </div>
            </motion.div>
            <motion.div
              className='contact__card bg-white shadow-lg rounded-lg p-6'
              initial='hidden'
              whileInView='visible'
              variants={cardVariants}
              viewport={{ once: true }}
              layout='position'
            >
              <div className=''>
                <h2 className='contact__card-title'>Email</h2>
                <h3 className='contact__card-data'>
                  sales@statsurgicalsupply.com
                </h3>
                <a
                  href='mailto:sales@statsurgicalsupply.com'
                  className='contact__button'
                  target='_blank'
                >
                  Write to us! <BiArrowFromLeft />
                </a>
              </div>
            </motion.div>
          </div>
          <ContactUs />
        </div>
      </div>
    </section>
  );
};

export default Contact;
