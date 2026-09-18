import React, { useEffect, useRef, useState } from "react";
import { Listbox } from "@headlessui/react";
import axios from "axios";
import { BiMessageAdd } from "react-icons/bi";
import { useModalContext } from "../context/ModalContext";
import { getError } from "../../utils/error";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

const SearchForm = ({ name, searchedWord, setName, setSearchedWord }) => {
  const form = useRef();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [phone, setPhone] = useState("");
  const { contact, showStatusMessage, accountOwner } = useModalContext();
  const [uom, setUom] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const uomOptions = ["Box", "Each"];

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
        uom,
      });
      sendEmail(e);
      form.current.reset();
    } catch (err) {
      showStatusMessage("error", getError(err) || "Something went wrong");
    }
  };

  const sendEmail = (e) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !phone ||
      !manufacturer ||
      !quantity ||
      !message ||
      !uom
    ) {
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
      uom,
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
      item,
    );
    handleSendEmails(emailMessage, contactToEmail, accountOwner);
    showStatusMessage("success", "Request sent successfully");
  };

  useEffect(() => {
    if (contact) {
      const fullName = [contact.firstName, contact.lastName]
        .filter(Boolean)
        .join(" ");
      if (fullName) setName(fullName);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (contact.email) setEmail(contact.email);
    }
  }, [contact]);

  return (
    <div className='max-w-4xl mx-auto p-5 md:col-span-2 lg:col-span-3'>
      <div className='text-center mb-8'>
        <h2 className='section__subtitle'>
          We don’t list “{searchedWord || "that item"}” online — we can still
          help
        </h2>
        <p className='section__text text-center max-w-2xl mx-auto mt-3'>
          A missing catalog result does not mean the product is unavailable.
          STAT Surgical Supply routinely sources OEM-sealed disposables, reviews
          clinically equivalent substitutes, and prepares a quote for hospitals
          and surgery centers.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3 mb-8'>
        <div className='rounded-lg border border-gray-200 bg-white p-4 text-left'>
          <p className='font-semibold text-[#0e355e] mb-1'>Source it</p>
          <p className='text-sm text-gray-600'>
            We search U.S. hospital and ASC inventory for factory-sealed,
            in-date OEM product.
          </p>
        </div>
        <div className='rounded-lg border border-gray-200 bg-white p-4 text-left'>
          <p className='font-semibold text-[#0e355e] mb-1'>Substitute it</p>
          <p className='text-sm text-gray-600'>
            If the exact SKU is constrained, we can propose an equivalent
            reference your team can review.
          </p>
        </div>
        <div className='rounded-lg border border-gray-200 bg-white p-4 text-left'>
          <p className='font-semibold text-[#0e355e] mb-1'>Quote it</p>
          <p className='text-sm text-gray-600'>
            Tell us the reference and quantity. We reply with availability and
            pricing — usually the same business day.
          </p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 text-sm text-gray-700'>
        <span>Need it urgently? Call (813) 252-0727 · Mon–Fri 8AM–5PM EST</span>
        <span className='hidden sm:inline'>·</span>
        <span>New, unused, original manufacturer packaging</span>
      </div>

      {!showRequestForm ?
        <div className='text-center'>
          <button
            type='button'
            className='button button--flex btn-contact inline-flex items-center justify-center'
            onClick={() => setShowRequestForm(true)}
          >
            <span className='text-white'>
              Request a source, substitute, or quote
            </span>
          </button>
          <p className='mt-3 text-sm text-gray-500'>
            Takes about one minute. No account required.
          </p>
        </div>
      : <form
          className='contact__form_searched-div'
          ref={form}
          onSubmit={submitHandler}
        >
          <div className='mb-4 font-bold text-[#0e355e]'>
            Product request — we will source, substitute, or quote
          </div>

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
              placeholder='Catalog / REF number'
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
              placeholder='Manufacturer name'
              name='manufacturer'
              className='contact__form-input'
              onChange={(e) => setManufacturer(e.target.value)}
              value={manufacturer}
              required
            />
          </div>

          <div className='contact__form-div'>
            <label className='contact__form-tag'>Quantity needed*</label>
            <input
              autoComplete='off'
              type='number'
              min='0'
              step='1'
              placeholder='Quantity'
              name='quantity'
              className='contact__form-input'
              onChange={(e) => setQuantity(e.target.value)}
              value={quantity}
              required
            />
          </div>

          <div className='contact__form-div w-full z-50'>
            <label className='contact__form-tag'>
              Unit of measure (Box or Each)*
            </label>
            <Listbox value={uom} onChange={setUom}>
              <div className='relative'>
                <Listbox.Button className='contact__form-input w-full flex justify-between items-center pr-10'>
                  {uom || "Select an option"}
                  <ChevronUpDownIcon className='h-5 w-5 text-gray-400 absolute right-3' />
                </Listbox.Button>
                <Listbox.Options className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none text-sm'>
                  {uomOptions.map((option) => (
                    <Listbox.Option
                      key={option}
                      value={option}
                      className={({ active }) =>
                        `cursor-pointer select-none px-4 py-2 ${
                          active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span className='flex items-center justify-between'>
                          {option}
                          {selected && (
                            <CheckIcon className='w-4 h-4 text-blue-600' />
                          )}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          <div className='contact__form-div'>
            <label className='contact__form-tag'>Name*</label>
            <input
              autoComplete='off'
              type='text'
              placeholder='Your name'
              name='Name'
              className='contact__form-input'
              onChange={(e) => setName(e.target.value)}
              value={name}
              required={!contact}
            />
          </div>

          <div className='contact__form-div'>
            <label className='contact__form-tag'>Email*</label>
            <input
              autoComplete='off'
              type='email'
              placeholder='Work email'
              name='email'
              className='contact__form-input'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required={!contact}
            />
          </div>

          <div className='contact__form-div'>
            <label className='contact__form-tag'>Phone*</label>
            <input
              autoComplete='off'
              type='tel'
              placeholder='Direct phone'
              name='phone'
              className='contact__form-input'
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              required={!contact}
            />
          </div>

          <div className='contact__form-div'>
            <label className='contact__form-tag'>
              What do you need? (source / substitute / quote)*
            </label>
            <textarea
              name='message'
              className='contact__form-input contact__message'
              placeholder='Example: Need 4 boxes of REF XXXXX for cases next week. Open to equivalent if exact SKU is backordered.'
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              required
            />
          </div>

          <p className='text-xs text-gray-500 mb-3'>
            Submitting this form does not place an order. A specialist will
            confirm availability, dating, and price before anything ships.
          </p>

          <button className='button button--flex btn-contact w-full flex items-center justify-center'>
            <span className='text-white'>Send request {tab}</span>
            <BiMessageAdd className='text-white ml-2' />
          </button>
        </form>
      }
    </div>
  );
};

export default SearchForm;
