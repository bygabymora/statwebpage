import React, { useEffect } from "react";
import { useContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { FaTruckMoving, FaClipboardCheck, FaBuilding } from "react-icons/fa";
import { AiFillCheckCircle } from "react-icons/ai";
import { Store } from "../../utils/Store";
import states from "../../utils/states.json";
import formatPhoneNumber from "../../utils/functions/phoneModified";

export default function Shipping({
  setActiveStep,
  order,
  setOrder,
  customer,
  setCustomer,
  user,
  setUser,
}) {
  const { data: session } = useSession();
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const fetchUserData = async () => {
    const response = await axios.get(`api/users/${session?.user?._id}`);
    const userData = response.data.user;
    const customerData = response.data.customer;
    if (userData && customerData) {
      setCustomer({ ...customerData, email: userData.email });
      setUser(userData);
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
        defaultTerm: customerData.defaultTerm || "Net. 30",
        shippingPreferences: {
          paymentMethod:
            customerData.fedexAccountNumber || customerData.upsAccountNumber
              ? "Use My Account"
              : "Bill me",
          carrier: customerData.fedexAccountNumber
            ? "FedEx"
            : customerData.upsAccountNumber
            ? "UPS"
            : "FedEx",
          account: customerData.fedexAccountNumber
            ? customerData.fedexAccountNumber
            : customerData.upsAccountNumber
            ? customerData.upsAccountNumber
            : "",
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
    if (session?.user?._id) fetchUserData();
  }, [session]);

  const submitHandler = async (data) => {
    try {
      const response = await axios.get(`api/users/${session.user._id}`);
      const userData = response.data.user;
      const customerData = response.data.customer;

      const updatedCustomer = await axios.put(
        `/api/customer/${customerData._id}/updateAddresses`,
        {
          customer,
        }
      );
      console.log("Customer updated successfully", updatedCustomer.data);

      if (!userData) {
        toast.error("User not found, please try to login again");
        return;
      }
      if (!customerData) {
        console.log("Customer not found, No Customer Linked to User");
      }

      dispatch({
        type: "SAVE_SHIPPING_ADDRESS",
        payload: data,
      });

      Cookies.set(
        "cart",
        JSON.stringify({ ...cart, shippingAddress: order.shippingAddress })
      );

      setActiveStep(2);
    } catch (error) {
      toast.error("An error occurred while fetching user data.");
      console.error(error);
    }
  };

  const handleInputChange = (type, field, value, secondField) => {
    if (field === "phone") {
      setCustomer((prev) => ({
        ...prev,
        purchaseExecutive: [
          ...prev.purchaseExecutive.map((executive) => {
            if (executive.email === user.email) {
              return {
                ...executive,
                phone: value,
              };
            }
            return executive;
          }),
        ],
      }));
    }

    if (type === "shipping") {
      if (field === "contactInfo") {
        setOrder((prev) => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            contactInfo: {
              ...prev.shippingAddress.contactInfo,
              [secondField]: value,
            },
          },
        }));
      } else {
        setOrder((prev) => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            [field]: value,
            country: "USA",
          },
        }));
      }
      setCustomer((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
          country: "USA",
        },
      }));
    }
  };

  const shippingOptions = [
    "FedEx Ground",
    "FedEx Express Saver",
    "FedEx 2nd Day",
    "FedEx 2nd Day AM",
    "FedEx Standard Overnight",
    "FedEx Priority Overnight",
    "FedEx First Overnight",
    "FedEx Saturday",
    "UPS Ground",
    "UPS 3 Day Select",
    "UPS 2nd Day Air",
    "UPS 2nd Day Air Early",
    "UPS Next Day Air Saver",
    "UPS Next Day Air",
    "UPS Next Day Air Early",
  ];

  const shippingPreferencesHandler = (field, value) => {
    setOrder((prev) => ({
      ...prev,
      shippingPreferences: {
        ...prev.shippingPreferences,
        [field]: value,
      },
    }));
    if (field === "shippingMethod") {
      if (value.includes("FedEx")) {
        setOrder((prev) => ({
          ...prev,
          shippingPreferences: {
            ...prev.shippingPreferences,
            carrier: "FedEx",
          },
        }));
      } else if (value.includes("UPS")) {
        setOrder((prev) => ({
          ...prev,
          shippingPreferences: {
            ...prev.shippingPreferences,
            carrier: "UPS",
          },
        }));
      }
    }
    if (field === "account") {
      if (order.shippingPreferences?.carrier === "FedEx") {
        setCustomer((prev) => ({
          ...prev,
          fedexAccountNumber: value,
        }));
      } else if (order.shippingPreferences?.carrier === "UPS") {
        setCustomer((prev) => ({
          ...prev,
          upsAccountNumber: value,
        }));
      }
    }
  };

  return (
    <>
      <div className='mx-auto max-w-2xl'>
        <h1 className='text-3xl font-bold text-center text-[#144e8b] mb-6'>
          Shipping Information
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
                          "contactInfo",
                          e.target.value,
                          "firstName"
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
                          "contactInfo",
                          e.target.value,
                          "lastName"
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
                      "contactInfo",
                      e.target.value,
                      "secondEmail"
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
              <h3 className='font-semibold'>Shipment Speed</h3>
              <select
                className='input-field'
                value={order.shippingPreferences?.shippingMethod || ""}
                onChange={(e) =>
                  shippingPreferencesHandler("shippingMethod", e.target.value)
                }
              >
                {shippingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className='mt-4'>
              <h3 className='font-semibold'>Carrier</h3>
              <select
                className='input-field'
                value={order.shippingPreferences?.carrier || ""}
                onChange={(e) =>
                  shippingPreferencesHandler("carrier", e.target.value)
                }
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
                value={order.shippingPreferences?.paymentMethod}
                onChange={(e) =>
                  shippingPreferencesHandler("paymentMethod", e.target.value)
                }
              >
                <option value='Bill me'>Bill Me</option>
                <option value='Use My Account'>Use My account</option>
              </select>
              {order.shippingPreferences?.paymentMethod ===
                "Use My Account" && (
                <div className='flex gap-2 items-center'>
                  <input
                    autoComplete='off'
                    className='input-field '
                    type='text'
                    placeholder='Enter your account number'
                    value={order.shippingPreferences?.account || ""}
                    onChange={(e) =>
                      shippingPreferencesHandler("account", e.target.value)
                    }
                  />
                  {order.shippingPreferences?.carrier === "FedEx" ? (
                    <p className='text-sm text-gray-500'>
                      FedEx Account Number
                    </p>
                  ) : order.shippingPreferences?.carrier === "UPS" ? (
                    <p className='text-sm text-gray-500'>UPS Account Number</p>
                  ) : null}
                </div>
              )}
            </div>
            <div>
              <div className='mb-4 my-4 font-bold text-[#144e8b]'>
                Additional notes (Specific Instructions)
              </div>
              <textarea
                className='w-full contact__form-input contact__message'
                value={order.shippingAddress?.notes || ""}
                onChange={(e) =>
                  handleInputChange("shipping", "notes", e.target.value)
                }
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
