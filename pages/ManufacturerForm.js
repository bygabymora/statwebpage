import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { BiMessageAdd } from 'react-icons/bi';
import Layout from '../components/Layout';

export default function ManufacturerForm() {
  const form = useRef();
  const fileInputRef = useRef(); // Add a separate ref for the file input

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();

    const fileInput = fileInputRef.current.files[0];

    if (fileInput) {
      const formData = new FormData();
      formData.append('user_name', name);
      formData.append('user_email', email);
      formData.append('company', company);
      formData.append('phone', phone);
      formData.append('message', message);
      formData.append('file', fileInput);

      emailjs
        .sendForm(
          'service_ej3pm1k',
          'template_6uwfj0h',
          form.current,
          'cKdr3QndIv27-P67m'
        )
        .then(
          (result) => {
            alert('Message sent, thank you for contacting us!');
            console.log(result.text);
          },
          (error) => {
            console.log(error.text);
          }
        );
      setName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setMessage('');
      setFile('');
    } else {
      alert('Please select a file');
    }
  };
  const tab = <>&nbsp;&nbsp;</>;

  return (
    <Layout title="Manufacturer Form">
      <div className="manufacturer__content">
        <h3 className="manufacturer__title">
          Please provide us with your inventory list along with the
          corresponding prices for each item.
        </h3>

        <form className="manufacturer__form" ref={form} onSubmit={sendEmail}>
          <div className="manufacturer__form-div">
            <label className="manufacturer__form-tag">Name*</label>
            <input
              type="text"
              name="user_name"
              className="manufacturer__form-input"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          <div className="manufacturer__form-div">
            <label className="manufacturer__form-tag">Email*</label>
            <input
              type="email"
              name="user_email"
              className="manufacturer__form-input"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div className="manufacturer__form-div">
            <label className="manufacturer__form-tag">Phone</label>
            <input
              type="phone"
              name="user_phone"
              className="manufacturer__form-input"
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
            />
          </div>
          <div className="manufacturer__form-div">
            <label className="manufacturer__form-tag">Company</label>
            <input
              type="company"
              name="user_company"
              className="manufacturer__form-input "
              onChange={(e) => setCompany(e.target.value)}
              value={company}
            />
          </div>

          <div className="manufacturer__form-div">
            <label className="manufacturer__form-tag">Message*</label>
            <textarea
              name="message"
              className="manufacturer__form-input contact__message"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              required
            />
          </div>

          <div className="manufacturer__form-div">
            <label className="manufacturer__form-tag">Upload File</label>
            <input
              type="file"
              name="file"
              onChange={(e) => setFile(e.target.value)}
              className="manufacturer__form-input"
              ref={fileInputRef}
              value={file}
            />
          </div>

          <button
            className="button button-flex rounded py-2 px-4 shadow outline-none hover:bg-gray-400 active:bg-gray-500 text-white w-full"
            type="submit"
            value="Send"
          >
            <span className="flex items-center justify-center text-white">
              Send {tab}
              <BiMessageAdd className="ml-2" />
            </span>
          </button>
        </form>
      </div>
    </Layout>
  );
}
