import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CheckoutWizard from '../components/CheckoutWizard';
import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

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

  const [filteredStates, setFilteredStates] = useState(usStates);

  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false); // Add state for tracking the visibility of suggestions

  const [selectedSuggestion, setSelectedSuggestion] = useState(-1); // Initialize to -1, meaning no suggestion is selected

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
    setValue('address', shippingAddress.address);
    setValue('state', shippingAddress.state);
    setValue('city', shippingAddress.city);
    setValue('postalCode', shippingAddress.postalCode);
  }, [setValue, shippingAddress]);

  const submitHandler = ({ fullName, address, state, city, postalCode }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: { fullName, address, state, city, postalCode },
    });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        shippingAddress: {
          fullName,
          address,
          state,
          city,
          postalCode,
        },
      })
    );

    router.push('/payment');
  };

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1}></CheckoutWizard>
      <form
        className="mx-auto max-w-screen-md w-full "
        onSubmit={handleSubmit(submitHandler)}
      >
        <div>
          <h1 className="text-2xl font-bold">Shipping Address</h1>
          <br />
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="fullName">Full Name</label>
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
          <label htmlFor="address">Address</label>
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
          <label htmlFor="state">State</label>
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
          <label htmlFor="city">City</label>
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
          <label htmlFor="postalCode">Postal Code</label>
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
        <div className="mb-4 contact__form-div">
          <button className="primary-button w-full" type="submit">
            Continue
          </button>
        </div>
      </form>
    </Layout>
  );
}

ShippingScreen.auth = true;
