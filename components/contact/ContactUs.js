import React, { useEffect, useRef, useState } from "react";
import { BiMessageAdd } from "react-icons/bi";
import { motion } from "framer-motion";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { useModalContext } from "../context/ModalContext";

const ContactUs = () => {
  const form = useRef();
  const [message, setMessage] = useState("");
  const { contact, showStatusMessage } = useModalContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const sendEmail = (e) => {
    e.preventDefault(); // Avoid the default behavior of the form.
    const contactToEmail = { name, email };
    const emailmessage = messageManagement(
      contactToEmail,
      "Contact Us",
      message
    );

    if (!name || !email || !message) {
      showStatusMessage("error", "Please fill all the fields");
      return;
    }

    handleSendEmails(emailmessage, contactToEmail);

    // Clear inputs after sending the email
    setName("");
    setEmail("");
    setMessage("");
  };

  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setEmail(contact.email || "");
    }
  }, [contact]);

  const tab = <>&nbsp;&nbsp;</>;

  return (
    <motion.div
      className='contact__content'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <h3 className='contact__title'>Send a message</h3>

      <form className='contact__form' ref={form} onSubmit={sendEmail}>
        <div className='contact__form-div'>
          <label className='contact__form-tag' htmlFor='user_name'>
            Name*
          </label>
          <input
            autoComplete='off'
            type='text'
            name='user_name'
            className='contact__form-input'
            onChange={(e) => setName(e.target.value)}
            value={name}
            id='user_name'
            required
          />
        </div>

        <div className='contact__form-div'>
          <label className='contact__form-tag' htmlFor='user_email'>
            Email*
          </label>
          <input
            autoComplete='off'
            type='email'
            name='user_email'
            className='contact__form-input'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            id='user_email'
            required
          />
        </div>

        <div className='contact__form-div'>
          <label className='contact__form-tag' htmlFor='message'>
            Message*
          </label>
          <textarea
            name='message'
            className='contact__form-input contact__message'
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            id='message'
            required
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='button button--flex btn-contact'
        >
          <span className='text-white'>Send Message {tab} </span>
          <BiMessageAdd className='text-white' />
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContactUs;
