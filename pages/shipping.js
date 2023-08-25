import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CheckoutWizard from '../components/CheckoutWizard';
import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function ShippingScreen() {
  const usStates = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
  ];

  const [lastOrder, setLastOrder] = useState(null);
  const [useLastAddress, setUseLastAddress] = useState(false);

  const [filteredStates, setFilteredStates] = useState(usStates);

  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false); // Add state for tracking the visibility of suggestions

  const [selectedSuggestion, setSelectedSuggestion] = useState(-1); // Initialize to -1, meaning no suggestion is selected
  const [shippingSpeed, setShippingSpeed] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [shippingPaymentMethod, setPaymentMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const handleShippingSpeedChange = (event) => {
    setShippingSpeed(event.target.value);
  };

  const handleShippingCompanyChange = (event) => {
    setShippingCompany(event.target.value);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleAccountNumberChange = (event) => {
    setAccountNumber(event.target.value);
  };

  const handleSpecialNotesChange = (event) => {
    setSpecialNotes(event.target.value);
  };

  const handleShippingInstructions = () => {
    const instructions = `Shipping Speed: ${shippingSpeed}, \nShipping Company: ${shippingCompany}, \nPayment Method: ${shippingPaymentMethod},  
    \n${
      shippingPaymentMethod === 'use my account'
        ? ` (Account Number: ${accountNumber})`
        : ''
    } 
     \n${specialNotes !== '' ? ` Specific Instructions: ${specialNotes}` : ''}`;

    setValue('notes', instructions); // Update the form value for 'notes' field
  };

  const handleStateChange = (event) => {
    const inputValue = event.target.value.toLowerCase();
    setInputValue(inputValue);
    let filteredOptions = [];
    if (inputValue.length >= 3) {
      filteredOptions = usStates.filter((state) =>
        state.toLowerCase().startsWith(inputValue)
      );
    }
    setFilteredStates(filteredOptions);
    setShowSuggestions(true);
    setSelectedSuggestion(-1); // Reset the selected suggestion when input value changes
  };

  const handleSelectState = (state) => {
    setValue('state', state);
    setShowSuggestions(false);
    setSelectedSuggestion(-1); // Reset the selected suggestion when an option is clicked
  };

  const handleKeyDown = (event) => {
    if (filteredStates.length > 0) {
      if (event.key === 'ArrowDown') {
        // Move selection down when ArrowDown key is pressed
        setSelectedSuggestion((prev) =>
          prev < filteredStates.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        // Move selection up when ArrowUp key is pressed
        setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (event.key === 'Enter') {
        // Select the currently highlighted suggestion when Enter key is pressed
        if (selectedSuggestion !== -1) {
          handleSelectState(filteredStates[selectedSuggestion]);
        }
      }
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const router = useRouter();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress } = cart;

  useEffect(() => {
    setValue('fullName', shippingAddress.fullName);
    setValue('company', shippingAddress.company);
    setValue('phone', shippingAddress.phone);
    setValue('address', shippingAddress.address);
    setValue('state', shippingAddress.state);
    setValue('city', shippingAddress.city);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('notes', shippingAddress.notes);
  }, [setValue, shippingAddress]);

  const submitHandler = ({
    fullName,
    company,
    phone,
    address,
    state,
    city,
    postalCode,
    notes,
  }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        company,
        phone,
        address,
        state,
        city,
        postalCode,
        notes,
      },
    });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        shippingAddress: {
          fullName,
          company,
          phone,
          address,
          state,
          city,
          postalCode,
          notes,
        },
      })
    );

    router.push('/payment');
  };

  useEffect(() => {
    const fetchLastOrder = async () => {
      try {
        const { data } = await axios.get('/api/orders/lastOrder');
        setLastOrder(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLastOrder();
  }, []);

  useEffect(() => {
    if (useLastAddress && lastOrder) {
      const { shippingAddress } = lastOrder;
      setValue('fullName', shippingAddress.fullName);
      setValue('company', shippingAddress.company);
      setValue('phone', shippingAddress.phone);
      setValue('address', shippingAddress.address);
      setValue('state', shippingAddress.state);
      setValue('city', shippingAddress.city);
      setValue('postalCode', shippingAddress.postalCode);
      setValue('notes', shippingAddress.notes);
    }
  }, [lastOrder, setValue, useLastAddress]);

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1}></CheckoutWizard>

      <form
        className="mx-auto max-w-screen-md w-full "
        onSubmit={handleSubmit(submitHandler)}
      >
        <div>
          <h1 className="text-2xl font-bold">Shipping Address</h1>
          <p className="text-center font-semibold m-5 ">
            Shipping charges are not included. We can either bill your shipping
            account, or ship on our account for an additional fee. If you would
            like us to bill you shipping, please understand that your order will
            not ship until shipping fees are paid.
          </p>
          <p className="text-xl text-center font-bold mb-5">
            Please select your preferences at the end.
          </p>
          {lastOrder && (
            <div className="mb-2 mt-2">
              <label htmlFor="useLastAddress" className="font-bold">
                Use last used address?
              </label>{' '}
              &nbsp;
              <input
                type="checkbox"
                id="useLastAddress"
                checked={useLastAddress}
                onChange={(e) => setUseLastAddress(e.target.checked)}
              />
              <div className="mb-2">
                <p className="text-sm">
                  {lastOrder.shippingAddress.fullName}
                  <br />{' '}
                  {lastOrder.shippingAddress.company && (
                    <>
                      {lastOrder.shippingAddress.company}
                      <br />{' '}
                    </>
                  )}
                  {lastOrder.shippingAddress.phone && (
                    <>
                      {lastOrder.shippingAddress.phone} <br />{' '}
                    </>
                  )}
                  {lastOrder.shippingAddress.address}
                  <br /> {lastOrder.shippingAddress.state}
                  <br /> {lastOrder.shippingAddress.city}
                  <br /> {lastOrder.shippingAddress.postalCode}
                  <br />{' '}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 contact__form-div">
          <label htmlFor="fullName">Full Name*</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="fullName"
            placeholder="Enter Full Name"
            {...register('fullName', { required: true, minLength: 3 })}
            autoFocus
            autoCapitalize="true"
            required
          />
          {errors.fullName && (
            <p className="text-red-500">Full Name is required.</p>
          )}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="company">Company</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="company"
            placeholder="Company's Name"
            {...register('company', { required: false, minLength: 3 })}
            autoFocus
            autoCapitalize="true"
          />
          {errors.company && (
            <p className="text-red-500">Please check Company{"'"}s name.</p>
          )}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="phone">Phone Number*</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="phone"
            placeholder="Enter Phone Number"
            {...register('phone', { required: true, minLength: 3 })}
            autoFocus
            autoCapitalize="true"
          />
          {errors.phone && (
            <p className="text-red-500">Phone Number is required.</p>
          )}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="address">Address*</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="adress"
            placeholder="Enter address"
            {...register('address', { required: true, minLength: 3 })}
            autoCapitalize="true"
            required
          />
          {errors.address && (
            <p className="text-red-500">Address is required.</p>
          )}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="state">State*</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="state"
            placeholder="Enter state"
            {...register('state', { required: true, minLength: 3 })}
            onChange={handleStateChange}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown} // Add the onKeyDown event handler
            autoCapitalize="true"
            required
          />
          {errors.state && <p className="text-red-500">State is required.</p>}
          {filteredStates.length > 0 &&
            inputValue.length >= 3 &&
            showSuggestions && (
              <div className="mt-2 bg-white border border-gray-300 rounded-md absolute z-10 w-full">
                {filteredStates.map((state, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer py-1 px-4 hover:bg-gray-200 ${
                      index === selectedSuggestion ? 'bg-gray-200' : ''
                    }`} // Highlight the selected suggestion
                    onClick={() => handleSelectState(state)}
                  >
                    {state}
                  </div>
                ))}
              </div>
            )}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="city">City*</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="city"
            placeholder="Enter city"
            {...register('city', { required: true, minLength: 3 })}
            autoCapitalize="true"
            required
          />
          {errors.city && <p className="text-red-500">City is required.</p>}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="postalCode">Postal Code*</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="postalCode"
            placeholder="Enter postal code"
            {...register('postalCode', { required: true, minLength: 3 })}
            autoCapitalize="true"
            required
          />
          {errors.postalCode && (
            <p className="text-red-500">Postal Code is required.</p>
          )}
        </div>
        <div className="mx-auto max-w-screen-md">
          <h1 className="mb-4 text-xl">Shipping preferences</h1>
          <div className="mb-4 ">
            <h2 className="">Shipping Speed:</h2>
            <div>
              <input
                className="p-2 outline-none focus:ring-0"
                type="radio"
                name="shippingSpeed"
                value="Overnight"
                checked={shippingSpeed === 'Overnight'}
                onChange={handleShippingSpeedChange}
              />
              &nbsp;
              <label className="p-2">Overnight</label>
            </div>
            <div>
              <input
                className="p-2 outline-none focus:ring-0"
                type="radio"
                name="shippingSpeed"
                value="2-day"
                checked={shippingSpeed === '2-day'}
                onChange={handleShippingSpeedChange}
              />
              &nbsp;
              <label className="p-2">2-day</label>
            </div>
            <div>
              <input
                className="p-2 outline-none focus:ring-0"
                type="radio"
                name="shippingSpeed"
                value="3-day"
                checked={shippingSpeed === '3-day'}
                onChange={handleShippingSpeedChange}
              />
              &nbsp;
              <label className="p-2">3-day</label>
            </div>

            <div>
              <input
                className="p-2 outline-none focus:ring-0"
                type="radio"
                name="shippingSpeed"
                value="Ground"
                checked={shippingSpeed === 'Ground'}
                onChange={handleShippingSpeedChange}
              />
              &nbsp;
              <label className="p-2">Ground</label>
            </div>
          </div>

          <div className="mb-4 contact__form-div mt-4 flex flex-col">
            <h1 className="mb-4 ">Shipping Company:</h1>
            <div>
              <input
                className="p-2 outline-none focus:ring-0"
                type="radio"
                name="shippingCompany"
                value="FedEx"
                checked={shippingCompany === 'FedEx'}
                onChange={handleShippingCompanyChange}
              />
              <label className="p-2">FedEx</label>
            </div>
            <div>
              <input
                className="p-2 outline-none focus:ring-0"
                type="radio"
                name="shippingCompany"
                value="UPS"
                checked={shippingCompany === 'UPS'}
                onChange={handleShippingCompanyChange}
              />
              <label className="p-2">UPS</label>
            </div>
          </div>
          <div className="mb-4 contact__form-div flex flex-col">
            <h1 className="mb-4 ">Payment:</h1>
            <div>
              <input
                className="p-2 outline-none focus:ring-0"
                type="radio"
                name="shippingPaymentMethod"
                value="Bill me"
                checked={shippingPaymentMethod === 'Bill me'}
                onChange={handlePaymentMethodChange}
              />
              <label className="p-2">Bill me</label>
            </div>
            <div>
              <input
                className="p-2 outline-none focus:ring-0"
                type="radio"
                name="shippingPaymentMethod"
                value="use my account"
                checked={shippingPaymentMethod === 'use my account'}
                onChange={handlePaymentMethodChange}
              />
              <label className="p-2">Use my account</label>

              {shippingPaymentMethod === 'use my account' && (
                <input
                  className="w-full contact__form-input"
                  type="text"
                  placeholder="Please enter your account number"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                />
              )}
            </div>
            <div>
              <h1 className="mb-4 my-4">
                Aditional notes (Specific Instructions)
              </h1>
              <textarea
                className="w-full contact__form-input contact__message"
                value={specialNotes}
                onChange={handleSpecialNotesChange}
              />
            </div>
          </div>
          <div className="mb-4 contact__form-div" hidden>
            <label htmlFor="notes">Shipping Instructions</label>
            <textarea
              className="w-full contact__form-input contact__message"
              id="notes"
              placeholder="Shipping instructions"
              {...register('notes', { required: true, minLength: 3 })}
              autoCapitalize="true"
            />
          </div>
        </div>
        <br />
        <div className="mb-4 contact__form-div">
          <button
            className="primary-button w-full"
            type="submit"
            onClick={handleShippingInstructions}
          >
            Continue
          </button>
        </div>
      </form>
    </Layout>
  );
}

ShippingScreen.auth = true;
