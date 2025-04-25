import React, { useEffect, useState } from "react";
import Layout from "../components/main/Layout";
import CheckoutWizard from "../components/CheckoutWizard";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { Store } from "../utils/Store";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { FaTruckMoving, FaClipboardCheck, FaBuilding } from "react-icons/fa";
import { AiFillCheckCircle } from "react-icons/ai";

export default function ShippingScreen() {
  const { data: session } = useSession();
  const [name, setName] = useState("");

  useEffect(() => {
    console.log(name);
  }, [name]);

  const stateMap = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  const stateAbbreviations = {
    Alabama: "AL",
    Alaska: "AK",
    Arizona: "AZ",
    Arkansas: "AR",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    Florida: "FL",
    Georgia: "GA",
    Hawaii: "HI",
    Idaho: "ID",
    Illinois: "IL",
    Indiana: "IN",
    Iowa: "IA",
    Kansas: "KS",
    Kentucky: "KY",
    Louisiana: "LA",
    Maine: "ME",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Minnesota: "MN",
    Mississippi: "MS",
    Missouri: "MO",
    Montana: "MT",
    Nebraska: "NE",
    Nevada: "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    Ohio: "OH",
    Oklahoma: "OK",
    Oregon: "OR",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    Tennessee: "TN",
    Texas: "TX",
    Utah: "UT",
    Vermont: "VT",
    Virginia: "VA",
    Washington: "WA",
    "West Virginia": "WV",
    Wisconsin: "WI",
    Wyoming: "WY",
  };

  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress } = cart;

  const [lastOrder, setLastOrder] = useState(null);
  const [useLastAddress, setUseLastAddress] = useState(false);
  const [filteredStates, setFilteredStates] = useState(stateMap);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [shippingSpeed, setShippingSpeed] = useState("Overnight");
  const [shippingCompany, setShippingCompany] = useState("FedEx");
  const [shippingPaymentMethod, setPaymentMethod] = useState("Bill me");
  const [accountNumber, setAccountNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [sameAddress] = useState(true);

  const handleSpecialNotesChange = (event) => {
    setSpecialNotes(event.target.value);
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    if (session && session.user && session.user.name) {
      setName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    setValue("fullName", shippingAddress?.fullName);
    setValue("company", shippingAddress?.company);
    setValue("phone", shippingAddress?.phone);
    setValue("address", shippingAddress?.address);
    setValue("state", shippingAddress?.state);
    setInputValue(shippingAddress?.state || "");
    setValue("city", shippingAddress?.city);
    setValue("postalCode", shippingAddress?.postalCode);
    setValue("email", shippingAddress?.email);
    setValue("notes", shippingAddress?.notes);
  }, [setValue, shippingAddress]);

  const handleStateChange = (event) => {
    const value = event.target.value;
    setInputValue(value); // Muestra en el input

    const filtered = stateMap.filter((state) =>
      state.toLowerCase().startsWith(value.toLowerCase())
    );
    setFilteredStates(filtered);
    setShowSuggestions(true);
    setSelectedSuggestion(-1);
  };

  const handleSelectState = (state) => {
    setValue("state", state);
    setShowSuggestions(false);
    setInputValue(state);
    setSelectedSuggestion(-1); // Reset the selected suggestion when an option is clicked
  };

  const handleKeyDown = (event) => {
    if (filteredStates.length > 0) {
      if (event.key === "ArrowDown") {
        // Move selection down when ArrowDown key is pressed
        setSelectedSuggestion((prev) =>
          prev < filteredStates.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === "ArrowUp") {
        // Move selection up when ArrowUp key is pressed
        setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (event.key === "Enter") {
        // Select the currently highlighted suggestion when Enter key is pressed
        if (selectedSuggestion !== -1) {
          handleSelectState(filteredStates[selectedSuggestion]);
        }
      }
    }
  };

  const submitHandler = async (data) => {
    try {
      const response = await axios.get(`api/users/${session.user._id}`);
      const userData = response.data;

      if (!userData) {
        toast.error("User not found, please try to login again");
        return;
      }

      if (sameAddress) {
        data.fullNameB = data.fullName;
        data.companyB = data.company;
        data.phoneB = data.phone;
        data.addressB = data.address;
        data.stateB = data.state;
        data.cityB = data.city;
        data.postalCodeB = data.postalCode;
        data.emailB = data.email;
      }

      data.notes = specialNotes;
      const fullState = data.state;
      const abbreviation = stateAbbreviations[fullState] || fullState;
      data.state = abbreviation;

      dispatch({
        type: "SAVE_SHIPPING_ADDRESS",
        payload: data,
      });

      Cookies.set("cart", JSON.stringify({ ...cart, shippingAddress: data }));

      router.push("/payment");
    } catch (error) {
      toast.error("An error occurred while fetching user data.");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchLastOrder = async () => {
      try {
        const { data } = await axios.get("/api/orders/lastOrder");
        setLastOrder(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLastOrder();
  }, []);

  useEffect(() => {
    if (useLastAddress && lastOrder) {
      const { shippingAddress } = lastOrder;
      setValue("fullName", shippingAddress?.fullName);
      setValue("company", shippingAddress?.company);
      setValue("phone", shippingAddress?.phone);
      setValue("address", shippingAddress?.address);
      setValue("state", shippingAddress?.state);
      setValue("city", shippingAddress?.city);
      setValue("postalCode", shippingAddress?.postalCode);
      setValue("email", shippingAddress?.email);
      setValue("notes", shippingAddress?.notes);
    }
  }, [lastOrder, setValue, useLastAddress]);

  return (
    <Layout title='Shipping Address'>
      <CheckoutWizard activeStep={1} />
      <div className='mx-auto max-w-2xl'>
        <h1 className='text-3xl font-bold text-center text-[#144e8b] mb-6'>
          Shipping & Billing Information
        </h1>
        <p className='text-center font-semibold m-5 '>
          Shipping charges are not included. We can either bill your shipping
          account, or ship on our account for an additional fee. If you would
          like us to bill you shipping, please understand that your order will
          not ship until shipping fees are paid.
        </p>
        <p className='text-xl text-center font-bold mb-5'>
          Please select your preferences at the end.
        </p>
        {lastOrder && (
          <div className='mb-2 mt-2'>
            <div className='mb-2'>
              <p className='text-sm'>
                {lastOrder.shippingAddress?.fullName}
                {lastOrder.shippingAddress?.company}
                {lastOrder.shippingAddress?.phone}
                {lastOrder.shippingAddress?.address}
                {lastOrder.shippingAddress?.state}
                {lastOrder.shippingAddress?.city}
                {lastOrder.shippingAddress?.postalCode}
                {lastOrder.shippingAddress?.email}
              </p>
            </div>
          </div>
        )}
        <form className='space-y-6 my-5' onSubmit={handleSubmit(submitHandler)}>
          {/* SHIPPING ADDRESS */}
          <div className='bg-white shadow-md rounded-lg p-6'>
            <h2 className='text-xl font-semibold flex items-center gap-2 text-gray-700'>
              <FaTruckMoving className='text-[#144e8b]' />
              Shipping Address
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
              {lastOrder && (
                <div className='col-span-2 bg-blue-50 border border-blue-300 rounded-md p-4 mt-4 flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-700'>
                      We found a previous address from your last order.
                    </p>
                    <p className='text-sm text-gray-600 italic'>
                      {shippingAddress.fullName},
                      {shippingAddress.company && (
                        <>{shippingAddress.company},</>
                      )}
                      {shippingAddress.phone}, {shippingAddress.address},{" "}
                      {shippingAddress.state}, {shippingAddress.city},{" "}
                      {shippingAddress.postalCode}, {shippingAddress.email}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <label
                      htmlFor='useLastAddress'
                      className='text-sm font-medium'
                    >
                      Use another address?
                    </label>
                    <input
                      type='checkbox'
                      id='useLastAddress'
                      checked={useLastAddress}
                      onChange={(e) => setUseLastAddress(e.target.checked)}
                      className='h-4 w-4 accent-[#144e8b]'
                    />
                  </div>
                </div>
              )}
              <div>
                <label className='block font-medium'>Full Name*</label>
                <input
                  className='w-full contact__form-input'
                  type='text'
                  id='fullName'
                  placeholder='Enter Full Name'
                  {...register("fullName", { required: true, minLength: 3 })}
                  autoCapitalize='true'
                />
                {errors.fullName && (
                  <p className='text-red-500'>Full Name is required.</p>
                )}
              </div>
              <div>
                <label className='block font-medium'>Company</label>
                <input
                  className='w-full contact__form-input'
                  type='text'
                  id='company'
                  placeholder="Company's Name"
                  {...register("company", { required: false, minLength: 3 })}
                  autoCapitalize='true'
                />
                {errors.company && (
                  <p className='text-red-500'>
                    Please check Company{"'"}s name.
                  </p>
                )}
              </div>
              <div>
                <label className='block font-medium'>Phone Number*</label>
                <input
                  className='w-full contact__form-input'
                  type='text'
                  id='phone'
                  placeholder='Enter Phone Number'
                  {...register("phone", { required: true, minLength: 3 })}
                  autoCapitalize='true'
                />
                {errors.phone && (
                  <p className='text-red-500'>Phone Number is required.</p>
                )}
              </div>
              <div>
                <label className='block font-medium'>Address*</label>
                <input
                  className='w-full contact__form-input'
                  type='text'
                  id='address'
                  placeholder='Enter address'
                  {...register("address", { required: true, minLength: 3 })}
                  autoCapitalize='true'
                />
                {errors.address && (
                  <p className='text-red-500'>Address is required.</p>
                )}
              </div>
              <div className='relative w-full max-w-sm'>
                <label htmlFor='state' className='block font-medium mb-1'>
                  State*
                </label>
                <input
                  type='text'
                  id='state'
                  {...register("state", { required: true, minLength: 2 })}
                  className='w-full contact__form-input'
                  placeholder='Enter state'
                  onChange={handleStateChange}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  value={inputValue}
                  autoCapitalize='true'
                />
                {showSuggestions && filteredStates.length > 0 && (
                  <ul className='absolute z-10 w-full bg-white border border-gray-300 rounded shadow mt-1 max-h-48 overflow-y-auto'>
                    {filteredStates.map((state, index) => (
                      <li
                        key={state}
                        onClick={() => handleSelectState(state)}
                        className={`px-3 py-2 cursor-pointer ${
                          selectedSuggestion === index ? "bg-gray-100" : ""
                        }`}
                      >
                        {state}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.state && (
                  <p className='text-red-500'>State is required.</p>
                )}
              </div>
              <div>
                <label className='block font-medium'>City*</label>
                <input
                  className='w-full contact__form-input'
                  type='text'
                  id='city'
                  placeholder='Enter city'
                  {...register("city", { required: true, minLength: 3 })}
                  autoCapitalize='true'
                />
                {errors.city && (
                  <p className='text-red-500'>City is required.</p>
                )}
              </div>
              <div>
                <label className='block font-medium'>Postal Code*</label>
                <input
                  className='w-full contact__form-input'
                  type='text'
                  id='postalCode'
                  placeholder='Enter postal code'
                  {...register("postalCode", { required: true, minLength: 3 })}
                  autoCapitalize='true'
                />
                {errors.postalCode && (
                  <p className='text-red-500'>Postal Code is required.</p>
                )}
              </div>
              <div>
                <label className='block font-medium'>Email*</label>
                <input
                  className='w-full contact__form-input'
                  type='text'
                  id='email'
                  placeholder='Enter email'
                  {...register("email", { required: true, minLength: 3 })}
                  autoCapitalize='true'
                />
                {errors.email && (
                  <p className='text-red-500'>Email is required.</p>
                )}
              </div>
            </div>
          </div>

          {/* SHIPPING PREFERENCES */}
          <div className='bg-white shadow-md rounded-lg p-6'>
            <h2 className='text-xl font-semibold flex items-center gap-2 text-gray-700'>
              <FaClipboardCheck className='text-[#144e8b]' />
              Shipping Preferences
            </h2>
            <div className='mt-4'>
              <h3 className='font-semibold'>Shipping Speed</h3>
              <select
                className='input-field'
                value={shippingSpeed}
                onChange={(e) => setShippingSpeed(e.target.value)}
              >
                <option value='Overnight'>Overnight</option>
                <option value='2-day'>2-day</option>
                <option value='3-day'>3-day</option>
                <option value='Ground'>Ground</option>
              </select>
            </div>

            <div className='mt-4'>
              <h3 className='font-semibold'>Shipping Company</h3>
              <select
                className='input-field'
                value={shippingCompany}
                onChange={(e) => setShippingCompany(e.target.value)}
              >
                <option value='FedEx'>FedEx</option>
                <option value='UPS'>UPS</option>
              </select>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className='bg-white shadow-md rounded-lg p-6'>
            <h2 className='text-xl font-semibold flex items-center gap-2 text-gray-700'>
              <FaBuilding className='text-[#144e8b]' />
              Payment Method
            </h2>
            <div className='mt-4'>
              <label className='block font-semibold'>
                Select a payment method:
              </label>
              <select
                className='input-field'
                value={shippingPaymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value='Bill me'>Bill me</option>
                <option value='use my account'>Use my account</option>
              </select>
              {shippingPaymentMethod === "use my account" && (
                <input
                  className='input-field mt-2'
                  type='text'
                  placeholder='Enter your account number'
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              )}
            </div>
            <div>
              <div className='mb-4 my-4 font-bold text-[#144e8b]'>
                Additional notes (Specific Instructions)
              </div>
              <textarea
                className='w-full contact__form-input contact__message'
                value={specialNotes}
                onChange={handleSpecialNotesChange}
              />
            </div>
          </div>

          <button
            type='submit'
            className='primary-button w-full flex items-center justify-center gap-2'
          >
            <AiFillCheckCircle className='text-xl' />
            Continue
          </button>
        </form>
      </div>
    </Layout>
  );
}

ShippingScreen.auth = true;
