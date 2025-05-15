import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BiMessageAdd } from "react-icons/bi";
import { useModalContext } from "../context/ModalContext";
import { getError } from "../../utils/error";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";

const SearchForm = ({ name, searchedWord, setName, setSearchedWord }) => {
  const form = useRef();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [phone, setPhone] = useState("");
  const { contact, showStatusMessage, accountOwner } = useModalContext();

  const tab = <>&nbsp;&nbsp;</>;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/searched", {
        searchedWord,
        name,
        quantity,
        manufacturer,
        email,
        phone,
        message,
      });
      sendEmail(e);
      form.current.reset();
    } catch (err) {
      showStatusMessage("error", getError(err) || "Something went wrong");
    }
  };

  //-------------Email-------------//

  const sendEmail = (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !manufacturer || !quantity || !message) {
      showStatusMessage("error", "Please fill all the fields");
      return;
    }

    const contactToEmail = {
      name,
      email,
      phone,
      manufacturer,
      quantity,
      searchedWord,
    };

    const item = {
      searchedWord,
      quantity,
      manufacturer,
    };
    const emailMessage = messageManagement(
      contactToEmail,
      "Product Request",
      message,
      null,
      item
    );
    handleSendEmails(emailMessage, contactToEmail, accountOwner);
    showStatusMessage("success", "Request sent successfully");
  };

  useEffect(() => {
    if (contact) {
      setName(contact.firstName + " " + contact.lastName);
      setEmail(contact.email);
    }
  }, [contact]);

  //----------//

  return (
    <div className='max-w-4xl mx-auto p-5 md:col-span-2 lg:col-span-3'>
      <>
        <div className='text-center'>
          <h2 className='section__subtitle'>No products found</h2>
          <p className='section__text text-center font-semibold'>
            Kindly provide your contact details, and we will reach out to you
            once the product becomes available.
          </p>{" "}
        </div>
        <form
          className='contact__form_searched-div'
          ref={form}
          onSubmit={submitHandler}
        >
          <div className='mb-4 font-bold text-[#144e8b]'>Product Needed</div>
          <div className='contact__form-div' hidden>
            <label className='contact__form-tag'>Searched Word</label>
            <input
              autoComplete='off'
              type='text'
              name='searchedWord'
              className='contact__form-input'
              onChange={(e) => setSearchedWord(e.target.value)}
              value={searchedWord}
            />
          </div>
          <div className='contact__form-div'>
            <label className='contact__form-tag'>Reference*</label>
            <input
              autoComplete='off'
              type='text'
              placeholder='Please enter the product reference'
              name='searchedWord'
              className='contact__form-input'
              onChange={(e) => setSearchedWord(e.target.value)}
              value={searchedWord}
              required
            />
          </div>
          <div className='contact__form-div'>
            <label className='contact__form-tag'>Manufacturer*</label>
            <input
              autoComplete='off'
              type='text'
              placeholder='Please enter the manufacturer'
              name='manufacturer'
              className='contact__form-input'
              onChange={(e) => setManufacturer(e.target.value)}
              value={manufacturer}
              required
            />
          </div>
          <div className='contact__form-div'>
            <div className='contact__form-div'>
              <label className='contact__form-tag'>Quantity Needed</label>
              <input
                autoComplete='off'
                type='text'
                placeholder='Please enter the quantity needed'
                name='quantity'
                className='contact__form-input'
                onChange={(e) => setQuantity(e.target.value)}
                value={quantity}
              />
            </div>
          </div>
          <div className='contact__form-div'>
            <label className='contact__form-tag'>Name*</label>
            <input
              autoComplete='off'
              type='text'
              placeholder='Please enter your name'
              name='Name'
              className='contact__form-input'
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
          <div className='contact__form-div'>
            <label className='contact__form-tag'>Email*</label>
            <input
              autoComplete='off'
              type='email'
              placeholder='Please enter your email'
              name='email'
              className='contact__form-input '
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div className='contact__form-div'>
            <label className='contact__form-tag'>Phone</label>
            <input
              autoComplete='off'
              type='phone'
              placeholder='Please enter your phone number'
              name='phone'
              className='contact__form-input'
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              required
            />
          </div>

          <div className='contact__form-div'>
            <label className='contact__form-tag'>Message*</label>
            <textarea
              name='message'
              className='contact__form-input contact__message'
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              required
            />
          </div>
          <button className='button button--flex btn-contact w-full flex items-center justify-center'>
            <span className='text-white'>Send Your Request {tab} </span>
            <BiMessageAdd className='text-white ml-2' />
          </button>
        </form>
      </>
    </div>
  );
};

export default SearchForm;
