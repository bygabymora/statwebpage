import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ProductItem } from '../components/ProductItem.js';
import Layout from '../components/Layout';
import { BiMessageAdd } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { getError } from '../utils/error.js';

const SearchPage = ({ query }) => {
  const form = useRef();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [slug, setSlug] = useState('');
  const [quantity, setQuantity] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [phone, setPhone] = useState('');

  const tab = <>&nbsp;&nbsp;</>;

  useEffect(() => {
    const fetchSearchResults = async () => {
      const { data } = await axios.get(`/api/search?keyword=${query}`);
      setProducts(data);
    };

    fetchSearchResults();
  }, [query]);

  const submitHandler = async () => {
    try {
      await axios.post('/api/searched', {
        slug,
        quantity,
        manufacturer,
        fullName,
        email,
        phone,
        message,
      });

      form.current.reset();
      toast.success('Message sent successfully');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Search Results">
      <div>
        <h1 className="section__title">Search Results</h1>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-3">
            {products.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <>
            <div>
              <h2 className="section__subtitle">No products found</h2>
              <p className="section__text">
                Please leave us your information and we will contact you if we
                get the product
              </p>{' '}
            </div>
            <form
              className="contact__form_searched-div"
              ref={form}
              onSubmit={submitHandler}
            >
              <h1 className="mb-3">Product Needed</h1>
              <div className="contact__form-div">
                <label className="contact__form-tag">Reference*</label>
                <input
                  type="text"
                  name="slug"
                  className="contact__form-input"
                  onChange={(e) => setSlug(e.target.value)}
                  value={slug}
                  required
                />
              </div>
              <div className="contact__form-div">
                <label className="contact__form-tag">Manufacturer*</label>
                <input
                  type="text"
                  name="manufacturer"
                  className="contact__form-input"
                  onChange={(e) => setManufacturer(e.target.value)}
                  value={manufacturer}
                  required
                />
              </div>
              <div className="contact__form-div">
                <div className="contact__form-div">
                  <label className="contact__form-tag">Quantity Needed*</label>
                  <input
                    type="text"
                    name="quantity"
                    className="contact__form-input"
                    onChange={(e) => setQuantity(e.target.value)}
                    value={quantity}
                    required
                  />
                </div>
              </div>
              <div className="contact__form-div">
                <label className="contact__form-tag">Name*</label>
                <input
                  type="text"
                  name="fullName"
                  className="contact__form-input"
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  required
                />
              </div>
              <div className="contact__form-div">
                <label className="contact__form-tag">Email*</label>
                <input
                  type="email"
                  name="email"
                  className="contact__form-input"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
              <div className="contact__form-div">
                <label className="contact__form-tag">Phone</label>
                <input
                  type="phone"
                  name="phone"
                  className="contact__form-input"
                  onChange={(e) => setPhone(e.target.value)}
                  value={phone}
                  required
                />
              </div>

              <div className="contact__form-div">
                <label className="contact__form-tag">Message*</label>
                <textarea
                  name="message"
                  className="contact__form-input contact__message"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  required
                />
              </div>
              <button className="button button--flex btn-contact">
                <span className=" text-white">Send Message {tab} </span>
                <BiMessageAdd className=" text-white" />
              </button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
};

SearchPage.getInitialProps = ({ query }) => {
  return { query: query.query || '' };
};

export default SearchPage;
