import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { BiMessageAdd } from 'react-icons/bi';

const ContactUs = () => {
  const form = useRef();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        'service_ej3pm1k',
        'template_ml8ohai',
        form.current,
        'cKdr3QndIv27-P67m'
      )
      .then(
        (result) => {
          alert('Message sent, thank you for contacting us');
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
    setName('');
    setEmail('');
    setMessage('');
  };
  const tab = <>&nbsp;&nbsp;</>;

  return (
    <div className="contact__content">
      <h3 className="contact__title">Send a message</h3>

      <form className="contact__form" ref={form} onSubmit={sendEmail}>
        <div className="contact__form-div">
          <label className="contact__form-tag" for="user_name">
            Name*
          </label>
          <input
            type="text"
            name="user_name"
            className="contact__form-input"
            onChange={(e) => setName(e.target.value)}
            value={name}
            id="user_name"
            required
          />
        </div>

        <div className="contact__form-div">
          <label className="contact__form-tag" for="user_email">
            Email*
          </label>
          <input
            type="email"
            name="user_email"
            className="contact__form-input"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            id="user_email"
            required
          />
        </div>

        <div className="contact__form-div">
          <label className="contact__form-tag" for="message">
            Message*
          </label>
          <textarea
            name="message"
            className="contact__form-input contact__message"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            id="message"
            required
          />
        </div>
        <button className="button button--flex btn-contact">
          <span className=" text-white">Send Message {tab} </span>
          <BiMessageAdd className=" text-white" />
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
