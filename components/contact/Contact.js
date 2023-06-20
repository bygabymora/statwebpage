import React from 'react';
import ContactUs from './ContactUs';
import { BiArrowFromLeft } from 'react-icons/bi';

const Contact = () => {
  return (
    <section className="contact section" id="contact">
      <div className="contact__container">
        <br />
        <h1 className="section__title">Contact us!</h1>
        <span className="section__subtitle">
          Let&apos;s get in touch see how we could work together.
        </span>
        <div className="contact__container container grid">
          <div className="contact__content">
            <div className="contact__card">
              <h3 className="contact__card-title">Address</h3>
              <span className="contact__card-data">
                1000 Brickell Ave, Suite 1000, Miami, FL 33131
              </span>
            </div>
            <div className="contact__card">
              {' '}
              <h3 className="contact__card-title">Phone</h3>
              <span className="contact__card-data">813-252-0727 </span>
              <a
                href="https://wa.me/573022012043?text=Hi!%20I'm%20interested%20in%20your%20services%20as%20a%20web%20developer."
                className="contact__button"
                target="_blank"
              >
                Call us! <BiArrowFromLeft />
              </a>
            </div>
            <div className="contact__card">
              <h3 className="contact__card-title">Email</h3>
              <span className="contact__card-data">
                costumerservice@statsurgicalsupply.com
              </span>
              <a
                href="mailto:costumerservice@statsurgicalsupply.com"
                className="contact__button"
                target="_blank"
              >
                Write to us! <BiArrowFromLeft />
              </a>
            </div>
          </div>
          <ContactUs />
        </div>
      </div>
    </section>
  );
};

export default Contact;
