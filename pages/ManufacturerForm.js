import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { BiMessageAdd } from 'react-icons/bi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../components/main/Layout';

export default function ManufacturerForm() {
  const form = useRef();
  const fileInputRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendEmail = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    formDataToSend.append('my_file', file);

    try {
      await emailjs.sendForm(
        'service_ej3pm1k',
        'template_6uwfj0h',
        form.current,
        'cKdr3QndIv27-P67m'
      );
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
      setFile(null);
      fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <Layout title="Manufacturer Form">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 my-8">
        <h3 className="text-xl text-center font-semibold text-[#144e8b] mb-6">
          For the most accurate quote, please provide us with a list that
          includes reference numbers, quantities(each/box), and expiration
          dating.
        </h3>
        <form ref={form} onSubmit={sendEmail} className="space-y-6">
          {['name', 'email', 'company', 'phone'].map((field) => (
            <div key={field}>
              <label className="block text-[#144e8b] mb-2 capitalize">{field}*</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required={field !== 'company' && field !== 'phone'}
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#144e8b]"
              />
            </div>
          ))}
          <div>
            <label className="block text-[#144e8b] mb-2">Message*</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#144e8b]"
            />
          </div>
          <div>
            <label className="block text-[#144e8b] mb-2">Upload File*</label>
            <input
              type="file"
              name="my_file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#144e8b] hover:bg-[#788b9b] text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            Send
            <BiMessageAdd />
          </button>
        </form>
      </div>
    </Layout>
  );
}
