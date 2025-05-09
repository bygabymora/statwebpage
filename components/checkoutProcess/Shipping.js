import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { FaTruckMoving, FaClipboardCheck, FaBuilding } from "react-icons/fa";
import { AiFillCheckCircle } from "react-icons/ai";
import { Store } from "../../utils/Store";
import states from "../../utils/states.json";
import formatPhoneNumber from "../../utils/functions/phoneModified";

export default function Shipping({ setActiveStep, order, setOrder }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [lastOrder, setLastOrder] = useState(null);
  const [useLastAddress, setUseLastAddress] = useState(false);
  const [shippingSpeed, setShippingSpeed] = useState("Overnight");
  const [shippingCompany, setShippingCompany] = useState("FedEx");
  const [shippingPaymentMethod, setPaymentMethod] = useState("Bill me");
  const [accountNumber, setAccountNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  const handleSpecialNotesChange = (event) => {
    setSpecialNotes(event.target.value);
  };

  const fetchUserData = async () => {
    const response = await axios.get(`api/users/${session.user._id}`);
    const userData = response.data.user;
    const customerData = response.data.customer;
    if (userData && customerData) {
      setOrder((prev) => ({
        ...prev,
        wpUser: {
          userId: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        },
        shippingAddress: {
          contactInfo: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
          },
          companyName: customerData.companyName,
          phone: customerData.phone,
          address: customerData.location?.address,
          state: customerData.location?.state,
          city: customerData.location?.city,
          postalCode: customerData.location?.postalCode,
          suiteNumber: customerData.location?.suiteNumber,
          notes: specialNotes,
        },
        billingAddress: {
          contactInfo: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
          },
          companyName: customerData.companyName,
          phone: customerData.phone,
          address: customerData.billAddr?.address,
          state: customerData.billAddr?.state,
          city: customerData.billAddr?.city,
          postalCode: customerData.billAddr?.postalCode,
        },
      }));
    } else if (userData) {
      setOrder((prev) => ({
        ...prev,
        wpUser: {
          userId: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        },
        shippingAddress: {
          contactInfo: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
          },
          companyName: "",
          phone: "",
          address: "",
          state: "",
          city: "",
          postalCode: "",
          suiteNumber: "",
          notes: specialNotes,
        },
        billingAddress: {
          contactInfo: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
          },
          companyName: "",
          phone: "",
          address: "",
          state: "",
          city: "",
          postalCode: "",
        },
      }));
    }
  };
  useEffect(() => {
    if (shippingSpeed.includes("FedEx")) {
      setShippingCompany("FedEx");
    } else if (shippingSpeed.includes("UPS")) {
      setShippingCompany("UPS");
    }
  }, [shippingSpeed]);

  const submitHandler = async (data) => {
    setActiveStep(2);
    try {
      const response = await axios.get(`api/users/${session.user._id}`);
      const userData = response.data.user;
      const customerData = response.data.customer;
      if (!userData) {
        toast.error("User not found, please try to login again");
        return;
      }
      if (!customerData) {
        console.log("Customer not found, No Customer Linked to User");
      }
      data.notes = specialNotes;
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
    fetchUserData();
    fetchLastOrder();
  }, []);

  const handleInputChange = (type, field, value) => {
    if (type === "shipping") {
      setOrder((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value,
        },
      }));
    } else if (type === "billing") {
      setOrder((prev) => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value,
        },
      }));
    }
  };

  return (
    <>
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
        <div className='space-y-6 my-5'>
          {/* SHIPPING ADDRESS */}
          <div className='bg-white shadow-md rounded-lg p-4 sm:p-6'>
            <h2 className='text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-700'>
              <FaTruckMoving className='text-[#144e8b]' />
              Shipping Address
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
              {lastOrder && !lastOrder.warning && (
                <div className='col-span-1 sm:col-span-2 bg-blue-50 border border-blue-300 rounded-md p-4 mt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm text-gray-700'>
                      We found a previous address from your last order.
                    </p>
                    <p className='text-sm text-gray-600 italic'>
                      {lastOrder.shippingAddress?.fullName},
                      {lastOrder.shippingAddress?.company},
                      {lastOrder.shippingAddress?.phone},
                      {lastOrder.shippingAddress?.address},
                      {lastOrder.shippingAddress?.state},
                      {lastOrder.shippingAddress?.city},
                      {lastOrder.shippingAddress?.postalCode},
                      {lastOrder.shippingAddress?.suiteNumber},
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <label
                      htmlFor='useLastAddress'
                      className='text-sm font-medium'
                    >
                      Use address?
                    </label>
                    <input
                      autoComplete='off'
                      type='checkbox'
                      id='useLastAddress'
                      checked={useLastAddress}
                      onChange={(e) => setUseLastAddress(e.target.checked)}
                      className='h-4 w-4 accent-[#144e8b]'
                    />
                  </div>
                </div>
              )}
              <div className='col-span-1 sm:col-span-2 border p-3 rounded-md'>
                <h2 className='block font-medium '>Attn To:</h2>
                <div className=' grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block font-medium'>First Name*</label>
                    <input
                      autoComplete='off'
                      className='w-full contact__form-input'
                      type='text'
                      placeholder='First Name'
                      onChange={(e) =>
                        handleInputChange(
                          "shipping",
                          "contactInfo.firstName",
                          e.target.value
                        )
                      }
                      value={
                        order.shippingAddress?.contactInfo?.firstName || ""
                      }
                    />
                  </div>
                  <div>
                    <label className='block font-medium'>Last Name*</label>
                    <input
                      autoComplete='off'
                      className='w-full contact__form-input'
                      type='text'
                      placeholder='Last Name'
                      onChange={(e) =>
                        handleInputChange(
                          "shipping",
                          "contactInfo.lastName",
                          e.target.value
                        )
                      }
                      value={order.shippingAddress?.contactInfo?.lastName || ""}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className='block font-medium'>Company*</label>
                <input
                  autoComplete='off'
                  className='w-full contact__form-input'
                  type='text'
                  onChange={(e) =>
                    handleInputChange("shipping", "companyName", e.target.value)
                  }
                  value={order.shippingAddress?.companyName || ""}
                  placeholder="Company's Name"
                  autoCapitalize='true'
                />
              </div>
              <div>
                <label className='block font-medium'>Phone Number*</label>
                <input
                  autoComplete='off'
                  className='w-full contact__form-input'
                  type='text'
                  onChange={(e) => {
                    const { formattedDisplayValue, numericValue } =
                      formatPhoneNumber(e.target.value, false); // Get both values
                    handleInputChange("shipping", "phone", numericValue);
                    e.target.value = formattedDisplayValue;
                  }}
                  value={formatPhoneNumber(order.shippingAddress?.phone) || ""}
                  placeholder='Enter Phone Number'
                  autoCapitalize='true'
                />
              </div>
              <div>
                <label className='block font-medium'>Address*</label>
                <input
                  autoComplete='off'
                  className='w-full contact__form-input'
                  type='text'
                  onChange={(e) =>
                    handleInputChange("shipping", "address", e.target.value)
                  }
                  value={order.shippingAddress?.address || ""}
                  placeholder='Address'
                  autoCapitalize='true'
                />
              </div>
              <div>
                <label className='block font-medium'>Suite Number*</label>
                <input
                  autoComplete='off'
                  className='w-full contact__form-input'
                  type='text'
                  onChange={(e) =>
                    handleInputChange("shipping", "suiteNumber", e.target.value)
                  }
                  value={order.shippingAddress?.suiteNumber || ""}
                  placeholder='Suite Number'
                  autoCapitalize='true'
                />
              </div>
              <div className='relative w-full max-w-sm'>
                <label htmlFor='state' className='block font-medium mb-1'>
                  State*
                </label>
                <select
                  autoComplete='off'
                  onChange={(e) =>
                    handleInputChange("shipping", "state", e.target.value)
                  }
                  value={order.shippingAddress?.state || ""}
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                >
                  <option value='' className='text-gray-400'>
                    Select...
                  </option>
                  {states.map((state, index) => (
                    <option key={index} value={state.key}>
                      {state.value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block font-medium'>City*</label>
                <input
                  autoComplete='off'
                  className='w-full contact__form-input'
                  type='text'
                  onChange={(e) =>
                    handleInputChange("shipping", "city", e.target.value)
                  }
                  value={order.shippingAddress?.city || ""}
                  placeholder='City'
                  autoCapitalize='true'
                />
              </div>
              <div>
                <label className='block font-medium'>Zip Code*</label>
                <input
                  autoComplete='off'
                  className='w-full contact__form-input'
                  type='text'
                  onChange={(e) =>
                    handleInputChange("shipping", "postalCode", e.target.value)
                  }
                  value={order.shippingAddress?.postalCode || ""}
                  placeholder='Zip'
                  autoCapitalize='true'
                />
              </div>

              <div>
                <label className='block font-medium'>Email*</label>
                <input
                  autoComplete='off'
                  className='w-full contact__form-input bg-gray-100 text-gray-700 cursor-not-allowed'
                  type='text'
                  onChange={(e) =>
                    handleInputChange(
                      "shipping",
                      "contactInfo.email",
                      e.target.value
                    )
                  }
                  value={order.shippingAddress?.contactInfo?.email || ""}
                  readOnly
                />
              </div>
              <div>
                <label className='block font-medium'>Second Email*</label>
                <input
                  autoComplete='off'
                  className='w-full contact__form-input'
                  type='text'
                  onChange={(e) =>
                    handleInputChange(
                      "shipping",
                      "contactInfo.secondEmail",
                      e.target.value
                    )
                  }
                  value={order.shippingAddress?.contactInfo?.secondEmail || ""}
                  placeholder='Enter Another email'
                  autoCapitalize='true'
                />
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
                <option value='FedEx Ground'>FedEx Ground</option>
                <option value='FedEx Express Saver'>FedEx Express Saver</option>
                <option value='FedEx 2nd Day'>FedEx 2nd Day</option>
                <option value='FedEx 2nd Day AM'>FedEx 2nd Day AM</option>
                <option value='FedEx Standard Overnight'>
                  FedEx Standard Overnight
                </option>
                <option value='FedEx Priority Overnight'>
                  FedEx Priority Overnight
                </option>
                <option value='FedEx First Overnight'>
                  FedEx First Overnight
                </option>
                <option value='FedEx Saturday'>FedEx Saturday</option>
                <option value='UPS Ground'>UPS Ground</option>
                <option value='UPS 3 Day Select'>UPS 3 Day Select</option>
                <option value='UPS 2nd Day Air'>UPS 2nd Day Air</option>
                <option value='UPS 2nd Day Air Early'>
                  UPS 2nd Day Air Early
                </option>
                <option value='UPS Next Day Air Saver'>
                  UPS Next Day Air Saver
                </option>
                <option value='UPS Next Day Air'>UPS Next Day Air</option>
                <option value='UPS Next Day Air Early'>
                  UPS Next Day Air Early
                </option>
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
              Payment Method for shipping charges
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
                  autoComplete='off'
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
            onClick={submitHandler}
            className='primary-button w-full flex items-center justify-center gap-2'
          >
            <AiFillCheckCircle className='text-xl' />
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
