// components/contact/ContactUs.js
import React, { useEffect, useRef, useState } from "react";
import { BiMessageAdd } from "react-icons/bi";
import { motion } from "framer-motion";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { useModalContext } from "../context/ModalContext";
import ReCaptchaV2Checkbox from "../recaptcha/ReCaptchaV2Checkbox";

const ACTION = "contact_submit";

const ContactUs = () => {
  const form = useRef();
  const { contact, showStatusMessage } = useModalContext();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // New: reCAPTCHA v2 token (checkbox)
  const [captchaToken, setCaptchaToken] = useState(null);

  const sendEmail = async (e) => {
    e.preventDefault();

    // Honeypot
    const botField = e.target.bot_field?.value;
    if (botField) {
      console.warn("Bot submission blocked 🚫");
      return;
    }

    if (!name || !email || !message) {
      showStatusMessage("error", "Please fill all the fields");
      return;
    }

    // Validate that the checkbox has been checked
    if (!captchaToken) {
      showStatusMessage(
        "error",
        "Please confirm you are not a robot by ticking the checkbox."
      );
      return;
    }

    // Verify token on the server
    let verifyData = null;
    try {
      const verifyRes = await fetch("/api/recaptcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: captchaToken,
          action: ACTION,
          version: "v2", // important: we use the v2 secret
        }),
      });
      verifyData = await verifyRes.json();
    } catch (err) {
      console.error("[reCAPTCHA verify] network/fetch error:", err);
      showStatusMessage("error", "No network. Try again.");
      return;
    }

    if (!verifyData?.success) {
      console.warn("[reCAPTCHA verify] failed:", verifyData);
      const reason = verifyData?.reason;

      if (reason === "server_misconfig") {
        showStatusMessage(
          "error",
          "Server configuration error. Please try later."
        );
      } else if (reason === "missing_token") {
        showStatusMessage(
          "error",
          "reCAPTCHA error. Please reload and try again."
        );
      } else if (reason === "wrong_action") {
        showStatusMessage(
          "error",
          "Validation error. Please reload and try again."
        );
      } else if (reason === "low_score") {
        showStatusMessage(
          "error",
          "Could not verify you are human. Please try again."
        );
      } else if (reason === "google_not_success") {
        showStatusMessage("error", "reCAPTCHA failed with Google. Try again.");
      } else if (reason === "google_parse_error") {
        showStatusMessage(
          "error",
          "Unexpected response from Google. Try again."
        );
      } else {
        showStatusMessage("error", "reCAPTCHA verification failed.");
      }
      return;
    }

    // OK → send the email
    const contactToEmail = { name, email: email.trim().toLowerCase() };
    const emailmessage = messageManagement(
      contactToEmail,
      "Contact Us",
      message
    );

    try {
      await handleSendEmails(emailmessage, contactToEmail);
      showStatusMessage("success", "Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
      setCaptchaToken(null);

      // Optional: reset the v2 widget if you want
      if (typeof window !== "undefined" && window.grecaptcha) {
        // reset all widgets (simple and effective)
        window.grecaptcha.reset();
      }
    } catch (err) {
      console.error("[ContactUs] handleSendEmails error:", err);
      showStatusMessage("error", "There was a problem sending your message.");
    }
  };

  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setEmail((contact.email || "").toLowerCase());
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
        {/* Honeypot */}
        <div style={{ display: "none" }}>
          <label>Do not fill this field</label>
          <input
            type='text'
            name='bot_field'
            tabIndex='-1'
            autoComplete='off'
          />
        </div>

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
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
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

        {/* Here the visible reCAPTCHA v2 checkbox is shown */}
        <div className='contact__form-div'>
          <ReCaptchaV2Checkbox onChange={setCaptchaToken} />
        </div>

        <motion.button
          type='submit'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='button button--flex btn-contact'
        >
          <span className='text-white'>Send Message {tab}</span>
          <BiMessageAdd className='text-white' />
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContactUs;
