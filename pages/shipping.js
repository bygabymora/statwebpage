import React, { useEffect, useState } from 'react';
import Layout from '../components/main/Layout';
import CheckoutWizard from '../components/CheckoutWizard';
import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { FaTruckMoving, FaClipboardCheck, FaBuilding } from 'react-icons/fa';
import { AiFillCheckCircle } from 'react-icons/ai';

export default function ShippingScreen() {
  const { data: session } = useSession();
  const [setName] = useState('');

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
  const [shippingSpeed, setShippingSpeed] = useState('Overnight');
  const [shippingCompany, setShippingCompany] = useState('FedEx');
  const [shippingPaymentMethod, setPaymentMethod] = useState('Bill me');
  const [accountNumber, setAccountNumber] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [sameAddress] = useState(true);

  const handleSpecialNotesChange = (event) => {
    setSpecialNotes(event.target.value);
  };

  useEffect(() => {
    if (session && session.user && session.user.name) {
      setName(session.user.name);
    }
  }, [session, session.user.name]);

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

  const submitHandler = async ({
    fullName,
    company,
    phone,
    address,
    state,
    city,
    postalCode,
    fullNameB,
    companyB,
    phoneB,
    addressB,
    stateB,
    cityB,
    postalCodeB,
    notes,
  }) => {
    try {
      // Fetch user info from the database
      const response = await axios.get(`api/users/${session.user._id}`);
      const userData = response.data;

      if (!userData) {
        toast.error('User not found, please try to login again');
        return; // Prevent form submission
      }

      // Continue with the form submission logic
      if (sameAddress) {
        fullNameB = fullName;
        companyB = company;
        phoneB = phone;
        addressB = address;
        stateB = state;
        cityB = city;
        postalCodeB = postalCode;
      }
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
          fullNameB,
          companyB,
          phoneB,
          addressB,
          stateB,
          cityB,
          postalCodeB,
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
          billingAddress: {
            fullNameB,
            companyB,
            phoneB,
            addressB,
            stateB,
            cityB,
            postalCodeB,
          },
      })
    );

      // Redirect to the payment page
    router.push('/payment');
    } catch (error) {
      // Handle errors (e.g., user not found, network issues)
      toast.error(
        'An error occurred while fetching user data, please check your session information or login again.'
      );
      console.error(error);
    }
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

  useEffect(() => {
    if (sameAddress) {
      if (
        shippingAddress.fullName &&
        shippingAddress.address &&
        shippingAddress.city &&
        shippingAddress.state &&
        shippingAddress.postalCode
      ) {
        setValue('fullNameB', shippingAddress.fullName);
        setValue('companyB', shippingAddress.company);
        setValue('phoneB', shippingAddress.phone);
        setValue('addressB', shippingAddress.address);
        setValue('stateB', shippingAddress.state);
        setValue('cityB', shippingAddress.city);
        setValue('postalCodeB', shippingAddress.postalCode);
      }
    }
  }, [sameAddress, setValue, shippingAddress]);

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1} />
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-[#144e8b] mb-6">
          Shipping & Billing Information
        </h1>
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
                  <br />
                  {lastOrder.shippingAddress.company}
                  <br />
                  {lastOrder.shippingAddress.phone}
                  <br />
                  {lastOrder.shippingAddress.address}
                  <br /> {lastOrder.shippingAddress.state}
                  <br /> {lastOrder.shippingAddress.city}
                  <br /> {lastOrder.shippingAddress.postalCode}
                  <br />{' '}
                </p>
              </div>
            </div>
          )}
        <form className="space-y-6 my-5" onSubmit={handleSubmit(submitHandler)}>
          {/* SHIPPING ADDRESS */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-700">
              <FaTruckMoving className="text-blue-500" />
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              
              <div>
                <label className="block font-medium">Full Name*</label>
                <input
                  className="w-full contact__form-input"
                  type="text"
                  id="fullNameB"
                  placeholder="Enter Full Name"
                  {...register('fullNameB', { required: false, minLength: 3 })}
                  autoCapitalize="true"
                  required
                />
                {errors.fullNameB && (
                  <p className="text-red-500">Full Name is required.</p>
                )}
              </div>
              <div>
                <label className="block font-medium">Company</label>
                <input
                  className="w-full contact__form-input"
                  type="text"
                  id="companyB"
                  value={session.user.companyName}
                  placeholder="Company's Name"
                  {...register('companyB', { required: false, minLength: 3 })}
                  autoCapitalize="true"
                  required
                />
                {errors.companyB && (
                  <p className="text-red-500">
                    Please check Company{"'"}s name.
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium">Phone Number*</label>
                <input
                  className="w-full contact__form-input"
                  type="text"
                  id="phoneB"
                  placeholder="Enter Phone Number"
                  {...register('phoneB', { required: false, minLength: 3 })}
                  autoCapitalize="true"
                  required
                />
                {errors.phoneB && (
                  <p className="text-red-500">Phone Number is required.</p>
                )}
              </div>
              <div>
                <label className="block font-medium">Address*</label>
                <input
                  className="w-full contact__form-input"
                  type="text"
                  id="addressB"
                  placeholder="Enter address"
                  {...register('addressB', { required: false, minLength: 3 })}
                  autoCapitalize="true"
                  required
                />
                {errors.addressB && (
                  <p className="text-red-500">Address is required.</p>
                )}
              </div>
              <div>
                <label className="block font-medium">State*</label>
                <input
                  className="w-full contact__form-input"
                  type="text"
                  id="stateB"
                  placeholder="Enter state"
                  {...register('stateB', { required: false, minLength: 3 })}
                  onChange={handleStateChange}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown} // Add the onKeyDown event handler
                  autoCapitalize="true"
                  required
                />
                {errors.stateB && (
                  <p className="text-red-500">State is required.</p>
                )}
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
              <div>
                <label className="block font-medium">City*</label>
                <input
                  className="w-full contact__form-input"
                  type="text"
                  id="cityB"
                  placeholder="Enter city"
                  {...register('cityB', { required: false, minLength: 3 })}
                  autoCapitalize="true"
                  required
                />
                {errors.cityB && (
                  <p className="text-red-500">City is required.</p>
                )}
              </div>
              <div>
                <label className="block font-medium">Postal Code*</label>
                <input
                  className="w-full contact__form-input"
                  type="text"
                  id="postalCodeB"
                  placeholder="Enter postal code"
                  {...register('postalCodeB', {
                    required: false,
                    minLength: 3,
                  })}
                  autoCapitalize="true"
                  required
                />
                {errors.postalCodeB && (
                  <p className="text-red-500">Postal Code is required.</p>
                )}
              </div>
            </div>
          </div>

          {/* SHIPPING PREFERENCES */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-700">
              <FaClipboardCheck className="text-blue-500" />
              Shipping Preferences
            </h2>
            <div className="mt-4">
              <h3 className="font-semibold">Shipping Speed</h3>
              <select
                className="input-field"
                value={shippingSpeed}
                onChange={(e) => setShippingSpeed(e.target.value)}
              >
                <option value="Overnight">Overnight</option>
                <option value="2-day">2-day</option>
                <option value="3-day">3-day</option>
                <option value="Ground">Ground</option>
              </select>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Shipping Company</h3>
              <select
                className="input-field"
                value={shippingCompany}
                onChange={(e) => setShippingCompany(e.target.value)}
              >
                <option value="FedEx">FedEx</option>
                <option value="UPS">UPS</option>
              </select>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-700">
              <FaBuilding className="text-blue-500" />
              Payment Method
            </h2>
            <div className="mt-4">
              <label className="block font-semibold">Select a payment method:</label>
              <select
                className="input-field"
                value={shippingPaymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Bill me">Bill me</option>
                <option value="use my account">Use my account</option>
              </select>
              {shippingPaymentMethod === 'use my account' && (
                <input
                  className="input-field mt-2"
                  type="text"
                  placeholder="Enter your account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
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

          {/* SUBMIT BUTTON */}
          <button className="primary-button w-full flex items-center justify-center gap-2">
            <AiFillCheckCircle className="text-xl" />
            Continue
          </button>
        </form>
      </div>
    </Layout>
  );
}

ShippingScreen.auth = true;
