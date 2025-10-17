import React, { useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import states from "../../utils/states.json";
import formatPhoneNumber from "../../utils/functions/phoneModified";
import { useModalContext } from "../context/ModalContext";

export default function Shipping({
  setActiveStep,
  order,
  setOrder,
  customer,
  setCustomer,
}) {
  const { data: session } = useSession();
  const { fetchUserData, user, showStatusMessage } = useModalContext();

  const fetchOrderData = async () => {
    const { userData, customerData } = await fetchUserData();
    if (userData) {
      setOrder((prev) => ({
        ...prev,
        wpUser: {
          userId: userData?._id,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          email: userData?.email,
        },
        shippingAddress: {
          contactInfo: {
            firstName: userData?.firstName,
            lastName: userData?.lastName,
            email: userData?.email,
          },
          companyName: order.shippingAddress?.companyName
            ? order.shippingAddress?.companyName
            : customerData?.companyName,
          phone: order.shippingAddress?.phone
            ? order.shippingAddress?.phone
            : customerData?.phone,
          address: order.shippingAddress?.address
            ? order.shippingAddress?.address
            : customerData?.location?.address,
          state: order.shippingAddress?.state
            ? order.shippingAddress?.state
            : customerData?.location?.state,
          city: order.shippingAddress?.city
            ? order.shippingAddress?.city
            : customerData?.location?.city,
          postalCode: order.shippingAddress?.postalCode
            ? order.shippingAddress?.postalCode
            : customerData?.location?.postalCode,
          suiteNumber: order.shippingAddress?.suiteNumber
            ? order.shippingAddress?.suiteNumber
            : customerData?.location?.suiteNumber,
          notes: order.shippingAddress?.notes
            ? order.shippingAddress?.notes
            : "",
        },
        billingAddress: {
          contactInfo: {
            firstName: order.billingAddress?.contactInfo?.firstName
              ? order.billingAddress?.contactInfo?.firstName
              : userData?.firstName,
            lastName: order.billingAddress?.contactInfo?.lastName
              ? order.billingAddress?.contactInfo?.lastName
              : userData?.lastName,
            email: order.billingAddress?.contactInfo?.email
              ? order.billingAddress?.contactInfo?.email
              : customerData?.email
              ? customerData?.email
              : userData?.email,
          },
          companyName: order.billingAddress?.companyName
            ? order.billingAddress?.companyName
            : customerData?.companyName,
          phone: order.billingAddress?.phone
            ? order.billingAddress?.phone
            : customerData?.companyName,
          address: order.billingAddress?.address
            ? order.billingAddress?.address
            : customerData?.billAddr?.address,
          state: customerData?.billAddr?.state,
          city: order.billingAddress?.city
            ? order.billingAddress?.city
            : customerData?.billAddr?.city,
          postalCode: order.billingAddress?.postalCode
            ? order.billingAddress?.postalCode
            : customerData?.billAddr?.postalCode,
        },
        customer: {
          ...customerData,
        },
        defaultTerm: order.defaultTerm
          ? order.defaultTerm
          : customerData?.defaultTerm || "Net. 30",

        shippingPreferences: {
          paymentMethod: order.shippingPreferences?.paymentMethod
            ? order.shippingPreferences?.paymentMethod
            : customerData?.fedexAccountNumber || customerData?.upsAccountNumber
            ? "Use My Account"
            : "Bill Me",
          carrier: order.shippingPreferences?.carrier
            ? order.shippingPreferences?.carrier
            : customerData?.fedexAccountNumber
            ? "FedEx"
            : customerData?.upsAccountNumber
            ? "UPS"
            : "FedEx",
          account: order.shippingPreferences?.account
            ? order.shippingPreferences?.account
            : customerData?.fedexAccountNumber
            ? customerData?.fedexAccountNumber
            : customerData?.upsAccountNumber
            ? customerData?.upsAccountNumber
            : "",
          shippingMethod: order.shippingPreferences?.shippingMethod
            ? order.shippingPreferences?.shippingMethod
            : customerData?.fedexAccountNumber
            ? "FedEx Ground"
            : customerData?.upsAccountNumber
            ? "UPS Ground"
            : "FedEx Ground",
        },
      }));
    }
  };
  useEffect(() => {
    if (session?.user?._id) fetchOrderData();
  }, [session]);

  const submitHandler = async () => {
    try {
      // 0) Basic guard: session must exist
      const userId = session?.user?._id;
      if (!userId) {
        showStatusMessage("error", "Session expired. Please sign in again.");
        return;
      }

      // 1) Fetch user + customer
      const { data: resp = {} } = await axios.get(`/api/users/${userId}`);
      const userData = resp?.wpUser ?? null;
      const customerData = resp?.customer ?? null;

      if (!userData) {
        showStatusMessage("error", "User not found, please try to login again");
        return;
      }

      // 2) If we have a customer doc and it has no location.address, update it
      if (customerData && !customerData?.location?.address) {
        const customerToSave = {
          ...(customer || {}),
          location: {
            ...(customer?.location || {}),
            address: order?.shippingAddress?.address || "",
            state: order?.shippingAddress?.state || "",
            city: order?.shippingAddress?.city || "",
            postalCode: order?.shippingAddress?.postalCode || "",
            suiteNumber: order?.shippingAddress?.suiteNumber || "",
          },
          billAddr: {
            ...(customer?.billAddr || {}),
            address: order?.billingAddress?.address || "",
            state: order?.billingAddress?.state || "",
            city: order?.billingAddress?.city || "",
            postalCode: order?.billingAddress?.postalCode || "",
          },
          purchaseExecutive: [
            {
              email: userData?.email || "",
              phone: order?.shippingAddress?.phone || "",
            },
          ],
        };

        setCustomer(customerToSave);

        // Only attempt the PUT if we truly have an _id to update
        if (customerData?._id) {
          const updatedCustomer = await axios.put(
            `/api/customer/${customerData._id}/updateAddresses`,
            { customer: customerToSave }
          );
          setCustomer(updatedCustomer?.data?.customer || customerToSave);
        } else {
          console.warn(
            "[submitHandler] Missing customer._id; skipping addresses update."
          );
        }
      } else if (!customerData) {
        // Optional: let the user know we couldn't find a customer record
        console.warn(
          "[submitHandler] No customer document returned for this user."
        );
      }

      // 3) Create/advance the order
      const orderToSave = {
        ...(order || {}),
        status: "In Process",
      };

      const { data } = await axios.post("/api/orders", { order: orderToSave });
      setOrder(data?.order || orderToSave);

      // 4) Advance step
      setActiveStep(2);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching user data.");
    }
  };

  const handleInputChange = (type, field, value, secondField) => {
    if (field === "phone") {
      setCustomer((prev) => ({
        ...prev,
        purchaseExecutive: [
          {
            email: user.email,
            phone: value,
          },
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
        location: {},
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
        <h1 className='text-3xl font-bold text-center text-[#0e355e] mb-6'>
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
              Shipping Address
            </h2>
            <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg flex flex-col md:justify-between'>
              <div className='grid grid-cols-1 bg-white p-2 rounded-md sm:grid-cols-2 gap-4 '>
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
                        value={
                          order.shippingAddress?.contactInfo?.lastName || ""
                        }
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
                      handleInputChange(
                        "shipping",
                        "companyName",
                        e.target.value
                      )
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
                    value={
                      formatPhoneNumber(order.shippingAddress?.phone) || ""
                    }
                    placeholder='Enter Phone Number'
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
                  <label className='block font-medium'>Second Email</label>
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
                    value={
                      order.shippingAddress?.contactInfo?.secondEmail || ""
                    }
                    placeholder='Enter Another email'
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
                      handleInputChange(
                        "shipping",
                        "suiteNumber",
                        e.target.value
                      )
                    }
                    value={order.shippingAddress?.suiteNumber || ""}
                    placeholder='Suite Number'
                    autoCapitalize='true'
                  />
                </div>
                <div className='col-span-1 sm:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                  <div className='relative w-full max-w-sm'>
                    <label htmlFor='state' className='block font-medium'>
                      State*
                    </label>
                    <select
                      autoComplete='off'
                      onChange={(e) =>
                        handleInputChange("shipping", "state", e.target.value)
                      }
                      value={order.shippingAddress?.state || ""}
                      className='w-full contact__form-input'
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
                    <label className='block font-medium'>Zip Code*</label>
                    <input
                      autoComplete='off'
                      className='w-full contact__form-input'
                      type='text'
                      onChange={(e) =>
                        handleInputChange(
                          "shipping",
                          "postalCode",
                          e.target.value
                        )
                      }
                      value={order.shippingAddress?.postalCode || ""}
                      placeholder='Zip'
                      autoCapitalize='true'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHIPPING PREFERENCES */}
          <div className='bg-white shadow-md rounded-lg p-6'>
            <h2 className='text-xl font-semibold flex items-center gap-2 text-gray-700'>
              Shipping Preferences
            </h2>
            <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg flex flex-col md:justify-between'>
              <div className='grid grid-cols-1 bg-white p-2 rounded-md sm:grid-cols-2 gap-4 '>
                <div className='mt-4 flex-1'>
                  <h3 className='font-semibold'>Shipment Speed</h3>
                  <select
                    className='input-field'
                    value={order.shippingPreferences?.shippingMethod || ""}
                    onChange={(e) =>
                      shippingPreferencesHandler(
                        "shippingMethod",
                        e.target.value
                      )
                    }
                  >
                    {shippingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='mt-4 flex-1'>
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
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className='bg-white shadow-md rounded-lg p-6'>
            <h2 className='text-xl font-semibold flex items-center gap-2 text-gray-700'>
              Payment Method for shipping charges
            </h2>
            <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg flex flex-col md:justify-between'>
              <div className=' bg-white p-2 rounded-md gap-4 '>
                <div>
                  <label className='block font-semibold mb-2'>
                    Select a payment method for your shipping charges:
                  </label>
                  <div className='grid grid-cols-1 sm:grid-cols-2  gap-4 md:flex-row w-full items-start justify-between'>
                    <select
                      className='w-full contact__form-input'
                      value={order.shippingPreferences?.paymentMethod}
                      onChange={(e) =>
                        shippingPreferencesHandler(
                          "paymentMethod",
                          e.target.value
                        )
                      }
                    >
                      <option value='Bill Me'>Bill Me</option>
                      <option value='Use My Account'>Use My account</option>
                    </select>
                    {order.shippingPreferences?.paymentMethod ===
                      "Use My Account" && (
                      <div className='flex gap-2 flex-1 flex-col items-start'>
                        <input
                          autoComplete='off'
                          className='w-full contact__form-input'
                          type='text'
                          placeholder='Enter your account number'
                          value={order.shippingPreferences?.account || ""}
                          onChange={(e) =>
                            shippingPreferencesHandler(
                              "account",
                              e.target.value
                            )
                          }
                        />
                        {order.shippingPreferences?.carrier === "FedEx" ? (
                          <p className='text-sm text-gray-500'>
                            FedEx Account Number
                          </p>
                        ) : order.shippingPreferences?.carrier === "UPS" ? (
                          <p className='text-sm text-gray-500'>
                            UPS Account Number
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <div className='col-span-1 sm:col-span-2'>
                  <div className='mb-4 my-4 font-bold text-[#0e355e]'>
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
            </div>
            <div className='mt-6 flex px-6 justify-between'>
              <button
                type='button'
                className='px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition-all'
                onClick={() => setActiveStep(0)}
              >
                Back
              </button>
              <button
                onClick={submitHandler}
                type='submit'
                className='px-6 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#788b9b] transition-all'
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
