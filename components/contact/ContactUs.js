// components/contact/ContactUs.js
import React, { useEffect, useRef, useState } from "react";
import { BiMessageAdd } from "react-icons/bi";
import { motion } from "framer-motion";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { useModalContext } from "../context/ModalContext";
import ReCaptchaV2Checkbox from "../recaptcha/ReCaptchaV2Checkbox";

const ContactUs = () => {
  const form = useRef();
  const { contact, showStatusMessage } = useModalContext();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New: reCAPTCHA v2 token (checkbox)
  const [captchaToken, setCaptchaToken] = useState(null);

  const normalizeText = (value) =>
    (value || "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

  // Sync React state with actual form values (handles autofill)
  const syncFormValues = () => {
    if (form.current) {
      const formData = new FormData(form.current);
      const actualName = formData.get("user_name")?.trim() || "";
      const actualEmail =
        formData.get("user_email")?.trim().toLowerCase() || "";
      const actualMessage = formData.get("message")?.trim() || "";

      // Only update if values are different to avoid unnecessary re-renders
      if (actualName !== name) setName(actualName);
      if (actualEmail !== email) setEmail(actualEmail);
      if (actualMessage !== message) setMessage(actualMessage);
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Get actual form data from DOM (handles autofill that bypasses onChange)
      const formData = new FormData(e.currentTarget);
      const actualName = normalizeText(formData.get("user_name"));
      const actualEmail = normalizeText(
        formData.get("user_email"),
      ).toLowerCase();
      const actualMessage = normalizeText(formData.get("message"));

      // Honeypot
      const botField = normalizeText(formData.get("bot_field"));
      if (botField) {
        console.warn("Bot submission blocked");
        return;
      }

      if (!actualName || !actualEmail || !actualMessage) {
        showStatusMessage("error", "Please fill all the fields");
        return;
      }

      if (actualName.length < 2) {
        showStatusMessage(
          "error",
          "Please enter a valid name (at least 2 characters)",
        );
        return;
      }

      if (actualMessage.length < 10) {
        showStatusMessage(
          "error",
          "Please enter a more detailed message (at least 10 characters)",
        );
        return;
      }

      // Require at least 3 letters/numbers to reject punctuation-only content.
      const messageContentCheck = actualMessage.replace(/[^\p{L}\p{N}]/gu, "");
      if (messageContentCheck.length < 3) {
        showStatusMessage(
          "error",
          "Please enter a meaningful message with actual content",
        );
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(actualEmail)) {
        showStatusMessage("error", "Please enter a valid email address");
        return;
      }

      if (!captchaToken) {
        showStatusMessage(
          "error",
          "Please confirm you are not a robot by ticking the checkbox.",
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
            "Server configuration error. Please try later.",
          );
        } else if (reason === "missing_token") {
          showStatusMessage(
            "error",
            "reCAPTCHA error. Please reload and try again.",
          );
        } else if (reason === "google_not_success") {
          showStatusMessage(
            "error",
            "reCAPTCHA failed with Google. Try again.",
          );
        } else if (reason === "google_parse_error") {
          showStatusMessage(
            "error",
            "Unexpected response from Google. Try again.",
          );
        } else {
          showStatusMessage("error", "reCAPTCHA verification failed.");
        }
        return;
      }

      const contactToEmail = { name: actualName, email: actualEmail };
      const emailmessage = messageManagement(
        contactToEmail,
        "Contact Us",
        actualMessage,
      );

      console.log("[ContactUs Tracker] emailmessage:", {
        subject: emailmessage?.subject || "(EMPTY)",
        hasP1: !!emailmessage?.p1,
        hasP2: !!emailmessage?.p2,
        hasP3: !!emailmessage?.p3,
      });

      if (
        !emailmessage?.subject ||
        !emailmessage?.p1 ||
        !contactToEmail.email
      ) {
        console.error(
          "[ContactUs Tracker] Email message is empty or recipient is missing. Aborting send.",
        );
        showStatusMessage(
          "error",
          "Something went wrong building the email. Please try again.",
        );
        return;
      }

      const response = await handleSendEmails(
        emailmessage,
        contactToEmail,
        null,
        "Contact Us",
      );

      if (response && !response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "[ContactUs Tracker] API returned error:",
          response.status,
          errorData,
        );
        showStatusMessage(
          "error",
          "There was a problem sending your message. Please try again.",
        );
        return;
      }
      showStatusMessage("success", "Message sent successfully!");

      if (form.current) {
        form.current.reset();
      }
      setName("");
      setEmail("");
      setMessage("");
      setCaptchaToken(null);

      if (typeof window !== "undefined" && window.grecaptcha) {
        window.grecaptcha.reset();
      }
    } catch (err) {
      console.error("[ContactUs] handleSendEmails error:", err);
      showStatusMessage("error", "There was a problem sending your message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setEmail((contact.email || "").toLowerCase());
    }
  }, [contact]);

  // Optional: Periodic check for autofill (handles delayed autofill)
  useEffect(() => {
    const interval = setInterval(syncFormValues, 1000);
    return () => clearInterval(interval);
  }, [name, email, message]); // Only run when state might be out of sync

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
            onBlur={syncFormValues}
            value={name}
            id='user_name'
            minLength={2}
            maxLength={100}
            pattern='[a-zA-ZÀ-ÿ\s]+'
            title='Please enter a valid name (at least 2 characters, letters only)'
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
            onBlur={syncFormValues}
            value={email}
            id='user_email'
            maxLength={254}
            title='Please enter a valid email address'
            required
          />
        </div>

        <div className='contact__form-div'>
          <label className='contact__form-tag' htmlFor='message'>
            Message* (minimum 10 characters)
          </label>
          <textarea
            name='message'
            className='contact__form-input contact__message'
            onChange={(e) => setMessage(e.target.value)}
            onBlur={syncFormValues}
            value={message}
            id='message'
            minLength={10}
            maxLength={2000}
            rows={4}
            placeholder='Please describe your inquiry in detail.'
            title='Please enter a detailed message (at least 10 characters)'
            required
          />
          {message.length > 0 && message.length < 10 && (
            <small className='text-red-500 mt-1 block'>
              Message too short. Please enter at least 10 characters.
            </small>
          )}
        </div>

        {/* Here the visible reCAPTCHA v2 checkbox is shown */}
        <div className='contact__form-div'>
          <ReCaptchaV2Checkbox
            id='recaptcha-v2-contact'
            onChange={setCaptchaToken}
          />
        </div>

        <motion.button
          type='submit'
          disabled={isSubmitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='button button--flex btn-contact'
        >
          <span className='text-white'>
            {isSubmitting ? "Sending..." : "Send Message"} {tab}
          </span>
          <BiMessageAdd className='text-white' />
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContactUs;
