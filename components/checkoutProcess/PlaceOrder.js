import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { useModalContext } from "../context/ModalContext";
import { getError } from "../../utils/error";
import formatPhoneNumber from "../../utils/functions/phoneModified";
import states from "../../utils/states.json";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";
import Stripe from "../../public/images/assets/PBS.png";
import { AiTwotoneLock } from "react-icons/ai";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PlaceOrder({
  setActiveStep,
  order,
  setOrder,
  fetchOrder,
  paypalDispatch,
  isPending,
}) {
  const {
    showStatusMessage,
    fetchUserData,
    setUser,
    setCustomer,
    customer,
    user,
    startLoading,
    stopLoading,
    openConfirmModal,
    accountOwner,
  } = useModalContext();
  const { data: session } = useSession();
  const [loading] = useState(false);
  const router = useRouter();
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const targetRef = useRef(null);

  // 2. In your handler, scroll into view
  const handleScroll = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  };
  const WIRE_PAYMENT_DISCOUNT_PERCENTAGE = 1.5;
  const itemsPrice = useMemo(
    () =>
      round2(order?.orderItems.reduce((a, c) => a + c.quantity * c.price, 0)),
    [order?.orderItems]
  );
  const isPayByWire = order?.paymentMethod === "Pay By Wire";
  const discountAmount = useMemo(
    () =>
      round2(
        itemsPrice * (isPayByWire ? WIRE_PAYMENT_DISCOUNT_PERCENTAGE / 100 : 0)
      ),
    [itemsPrice, isPayByWire]
  );
  const totalPrice = useMemo(
    () => round2(itemsPrice - discountAmount),
    [itemsPrice, discountAmount]
  );

  useEffect(() => {
    if (order._id && !order.isPaid && !window.paypal) {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get("/api/keys/paypal");
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      loadPaypalScript();
    }
  }, [paypalDispatch, order._id, order.isPaid]);

  const baseAction = async () => {
    try {
      const updatedEstimateItems = order?.orderItems?.map((item) => ({
        ...item,
        typeOfPurchase: item.typeOfPurchase?.toLowerCase(),
        unitPrice: item.price,
        approved: true,
      }));

      const buyer = customer?.purchaseExecutive?.find(
        (exec) =>
          exec.name?.trim().toLowerCase() ===
          user?.firstName.trim().toLowerCase()
      );

      // Update estimate API call
      await axios.post(`/api/estimates`, {
        user: {
          userId: customer.user?.userId,
          name: customer.user?.name,
          userQuickBooksId: customer.user?.userQuickBooksId,
        },
        warning: "Estimate created from WP",
        estimateItems: updatedEstimateItems,
        customer: {
          defaultTerms: order?.defaultTerm,
          _id: customer?._id,
          searchQuery: customer?.companyName,
          needFactCheck: customer?.needFactCheck,
          arFactCheck: customer?.arFactCheck,
          email: order.billingAddress?.contactInfo?.email,
          quickBooksCustomerId: customer?.quickBooksCustomerId,
          quickBooksProductionCustomerId:
            customer?.quickBooksProductionCustomerId,
          phone: customer?.phone,
          EIN: customer?.EIN,
          companyName: customer?.companyName,
          user: customer?.user,
          purchaseExecutive: customer?.purchaseExecutive,
          fedexAccountNumber: customer?.fedexAccountNumber,
          upsAccountNumber: customer?.upsAccountNumber,
          buyer: {
            name: buyer?.name || user?.firstName,
            email: buyer?.email || user?.email,
            lastName: buyer?.lastName || user?.lastName,
            _id: buyer?._id,
            role: "Buyer",
            title: "Buyer",
            phone: buyer?.phone || user?.phone,
          },
          location: {
            address: order.shippingAddress?.address,
            suiteNumber: order.shippingAddress?.suiteNumber,
            city: order.shippingAddress?.city,
            country: "US",
            state: order.shippingAddress?.state,
            postalCode: order.shippingAddress?.postalCode,

            attentionTo:
              order.shippingAddress?.contactInfo?.firstName +
              " " +
              order.shippingAddress?.contactInfo?.lastName,
          },
          billAddr: {
            address: order.billingAddress?.address,
            suiteNumber: order.billingAddress?.suiteNumber,
            city: order.billingAddress?.city,
            state: order.billingAddress?.state,
            country: "US",
            postalCode: order.billingAddress?.postalCode,
          },
        },
        shippingMethod: order.shippingPreferences?.shippingMethod,
        shippingBilling:
          order.shippingPreferences?.paymentMethod === "Bill Me"
            ? "Bill Invoice"
            : order.shippingPreferences?.paymentMethod === "Use My Account"
            ? order.shippingPreferences?.carrier +
              " " +
              order.shippingPreferences?.account
            : "Bill Invoice",
        paymentTerms: order?.defaultTerm,
        poNumber: order.poNumber,
        subtotal: order.subtotal,
        itemsPrice: order.itemsPrice,
        itemsQuantity: order.itemsQuantity,
        totalPrice: order.totalPrice,
        amount: order.amount,
        fileId: order.fileId,
        fileName: order.fileName,
        status: "On Hold",
        timePeriod: 24,
        linkedWpOrderId: order._id,
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        showStatusMessage("error", "Invalid request");
        console.error(error);
        router.reload();
      } else {
        showStatusMessage("error", "An error occurred");
        console.error(error);
      }
    }
  };

  const placeOrderAction = async () => {
    const confirmMessage = {
      title: "Are you sure?",
      body:
        order?.paymentMethod === "Stripe" &&
        order.shippingPreferences.paymentMethod === "Bill Me"
          ? `You selected the "Bill Me" option for the Shipping Payment. You are about to place an order. Please confirm that all the information is correct.`
          : "You are about to place an order. Please confirm that all the information is correct.",
      warning:
        order?.paymentMethod === "Stripe"
          ? order.shippingPreferences.paymentMethod === "Bill Me"
            ? "⚠ You will receive an email when your order is ready to ship, and the order with the shipment value included, so you can make the payment. ⚠"
            : "⚠ After the payment, any change will need to be processed by your Stat Rep. ⚠"
          : "⚠ You will have 2 hours to make any changes, after that time, the order will be processed. ⚠",
    };

    const action = async (confirmed) => {
      if (!confirmed) return;
      try {
        startLoading();
        const orderToPlace = { ...order, status: "Completed" };
        await axios.post("/api/orders", { order: orderToPlace });
        await baseAction();
        await axios.patch(`/api/users/${session.user._id}/cart`, {
          action: "clear",
        });
        await axios.put(`/api/customer/${customer._id}/updateAddresses`, {
          customer,
        });

        const updatedUser = await fetchUserData();
        setUser((u) => ({ ...u, cart: updatedUser.userData.cart }));

        // payment-method branch
        if (
          order.paymentMethod !== "Stripe" ||
          order.shippingPreferences.paymentMethod === "Bill Me"
        ) {
          router.push(`/order/${order._id}`);
          Cookies.remove("orderId");
          setOrder((o) => ({
            ...o,
            orderItems: [],
            itemsPrice: 0,
            totalPrice: 0,
          }));
          sendConfirmationEmail();
        } else {
          const stripe = await stripePromise;
          if (!stripe || typeof stripe.redirectToCheckout !== "function") {
            showStatusMessage("error", "Stripe initialization failed.");
            return;
          }
          const {
            data: { id: sessionId },
          } = await axios.post("/api/checkout_sessions", {
            totalPrice: Number(order.totalPrice),
            orderId: order._id,
          });
          Cookies.remove("orderId");
          setOrder((o) => ({
            ...o,
            orderItems: [],
            itemsPrice: 0,
            totalPrice: 0,
          }));
          sendConfirmationEmail();
          const result = await stripe.redirectToCheckout({ sessionId });
          if (result.error) {
            showStatusMessage("error", result.error.message);
          }
        }
      } catch (err) {
        console.error("Error placing order:", err);
        showStatusMessage(
          "error",
          err.message || "An error occurred while placing the order."
        );
        stopLoading();
      }
    };

    openConfirmModal(confirmMessage, action);
  };

  const placeOrderHandler = async () => {
    const isValid = await fetchOrder(placeOrderAction);
    if (!isValid) {
      handleScroll();
      return;
    }
    await placeOrderAction();
  };

  const handleInputChange = (type, field, value, secondField) => {
    if (type === "billing") {
      if (field === "contactInfo") {
        setOrder((prev) => ({
          ...prev,
          billingAddress: {
            ...prev.billingAddress,
            contactInfo: {
              ...prev.billingAddress.contactInfo,
              [secondField]: value,
            },
          },
        }));
      } else {
        setOrder((prev) => ({
          ...prev,
          billingAddress: {
            ...prev.billingAddress,
            [field]: value,
            country: "USA",
          },
        }));
      }
      setCustomer((prev) => ({
        ...prev,
        billAddr: {
          ...prev.billAddr,
          [field]: value,
          country: "USA",
        },
      }));
    }
  };

  // inside your PlaceOrder component
  const createOrder = (data, actions) => {
    if (!actions || !actions.order) {
      showStatusMessage(
        "error",
        "PayPal SDK is not loaded properly. Please refresh the page."
      );
      return;
    }

    // actions.order.create returns a Promise<string> with the PayPal order ID
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: totalPrice.toString(),
            },
            // this will show up in your PayPal dashboard as "custom_id"
            custom_id: order._id.toString(),
          },
        ],
      })
      .then((paypalOrderID) => {
        // paypalOrderID is the PayPal-generated ID for this transaction
        return paypalOrderID;
      });
  };

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details
        );
        showStatusMessage(
          "success",
          "Payment successful. Thank you for your order!"
        );
        setOrder((prev) => ({
          ...prev,
          isPaid: true,
          paidAt: data.paidAt,
          paymentResult: data.paymentResult,
        }));
      } catch (error) {
        showStatusMessage(
          "error",
          getError(error) || "An error occurred while processing the payment."
        );
      }
    });
  }

  function onError(error) {
    console.error("PayPal error:", error);
    showStatusMessage("error", getError(error));
  }
  const sendConfirmationEmail = async () => {
    try {
      const contactToEmail = {
        name: user.firstName,
        email: user.email,
      };
      const emailmessage = messageManagement(
        contactToEmail,
        "Order Confirmation",
        null,
        order,
        null,
        accountOwner
      );

      handleSendEmails(emailmessage, contactToEmail, accountOwner);
    } catch (error) {
      console.error("Error sending approval email:", error);
      showStatusMessage(
        "error",
        "Error sending approval email. Please try again."
      );
    }
  };
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
      gtag('event', 'ads_conversion_Carrito_de_la_compra_1', {
        value: ${order.totalPrice || 0},
        userName: '${user?.name || ""}',
        userEmail: '${user?.email || ""}',
      });
    `,
        }}
      />
      <h1 className='mb-6 text-2xl font-bold text-[#0e355e] text-center'>
        Confirm Your Order
      </h1>
      {order?.orderItems?.length === 0 ? (
        <div className='text-center text-gray-600 text-lg my-5'>
          Your cart is empty.{" "}
          <Link
            href='/products'
            className='underline font-bold text-[#0e355e] hover:text-[#122338] transition'
          >
            Go shopping
          </Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-4'>
          <div className='md:col-span-3'>
            <div className='card bg-white shadow-lg p-6 rounded-lg border mt-5'>
              <h2 className='mb-4 text-xl font-semibold text-[#0e355e]'>
                Payment and Billing
              </h2>
              <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg flex flex-col md:justify-between'>
                <div>
                  <h3 className='font-bold'> Payment Info</h3>
                  <div className=' bg-white p-2 rounded-md gap-4 mb-2 '>
                    <span>
                      Method:{" "}
                      {order?.paymentMethod === "Stripe"
                        ? "Credit Card (Powered by Stripe)"
                        : order?.paymentMethod}
                    </span>
                    {order.poNumber && <span>{" - " + order.poNumber}</span>}{" "}
                    <br />
                    {order?.paymentMethod === "PO Number"
                      ? "Terms: " + order.defaultTerm
                      : ""}
                    <br />
                    <button
                      className='font-bold text-[#0e355e] hover:text-[#122338] mt-3 transition'
                      onClick={() => {
                        setActiveStep(2);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className='font-bold'>Billing Address</h3>
                  <div className='grid grid-cols-1 bg-white p-2 sm:grid-cols-2 rounded-md gap-4 mt-4'>
                    <div className='col-span-1 sm:col-span-2 border p-3 rounded-md'>
                      <h2 className='block font-medium '>AP Contact:</h2>
                      <div className=' grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                          <label className='block font-medium'>
                            First Name*
                          </label>
                          <input
                            autoComplete='off'
                            className='w-full contact__form-input'
                            type='text'
                            placeholder='First Name'
                            onChange={(e) =>
                              handleInputChange(
                                "billing",
                                "contactInfo",
                                e.target.value,
                                "firstName"
                              )
                            }
                            value={
                              order.billingAddress?.contactInfo?.firstName || ""
                            }
                          />
                        </div>
                        <div>
                          <label className='block font-medium'>
                            Last Name*
                          </label>
                          <input
                            autoComplete='off'
                            className='w-full contact__form-input'
                            type='text'
                            placeholder='Last Name'
                            onChange={(e) =>
                              handleInputChange(
                                "billing",
                                "contactInfo",
                                e.target.value,
                                "lastName"
                              )
                            }
                            value={
                              order.billingAddress?.contactInfo?.lastName || ""
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
                            "billing",
                            "companyName",
                            e.target.value
                          )
                        }
                        value={order.billingAddress?.companyName || ""}
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
                          handleInputChange("billing", "phone", numericValue);
                          e.target.value = formattedDisplayValue;
                        }}
                        value={
                          formatPhoneNumber(order.billingAddress?.phone) || ""
                        }
                        placeholder='Enter Phone Number'
                        autoCapitalize='true'
                      />
                    </div>
                    <div>
                      <label className='block font-medium'>Email*</label>
                      <input
                        autoComplete='off'
                        className='w-full contact__form-input bg-gray-100 text-gray-700'
                        type='text'
                        onChange={(e) =>
                          handleInputChange(
                            "billing",
                            "contactInfo.email",
                            e.target.value
                          )
                        }
                        value={order.billingAddress?.contactInfo?.email || ""}
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
                            "billing",
                            "contactInfo",
                            e.target.value,
                            "secondEmail"
                          )
                        }
                        value={
                          order.billingAddress?.contactInfo?.secondEmail || ""
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
                          handleInputChange(
                            "billing",
                            "address",
                            e.target.value
                          )
                        }
                        value={order.billingAddress?.address || ""}
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
                            "billing",
                            "suiteNumber",
                            e.target.value
                          )
                        }
                        value={order.billingAddress?.suiteNumber || ""}
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
                            handleInputChange("billing", "city", e.target.value)
                          }
                          value={order.billingAddress?.city || ""}
                          placeholder='City'
                          autoCapitalize='true'
                        />
                      </div>
                      <div className='relative w-full max-w-sm'>
                        <label htmlFor='state' className='block font-medium '>
                          State*
                        </label>
                        <select
                          autoComplete='off'
                          onChange={(e) =>
                            handleInputChange(
                              "billing",
                              "state",
                              e.target.value
                            )
                          }
                          value={order.billingAddress?.state || ""}
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
                              "billing",
                              "postalCode",
                              e.target.value
                            )
                          }
                          value={order.billingAddress?.postalCode || ""}
                          placeholder='Zip'
                          autoCapitalize='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='card bg-white shadow-lg p-6 rounded-lg border'>
              {order?.orderItems &&
                order?.orderItems?.some((item) => item.sentOverNight) && (
                  <div className='alert-error bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg'>
                    <p className='font-semibold'>Important Notice:</p>
                    Some products require overnight shipping due to temperature
                    sensitivity. It is recommended that some of the products on
                    this order ship overnight. Stat Surgical Supply is not
                    responsible for product damage or failure if you choose
                    another shipping method.
                    <div className='mt-3'>
                      <button className='underline font-bold flex flex-row items-center text-[#b91c1c] hover:text-[#991b1b]'>
                        Products For Overnight Delivery
                      </button>
                      <ul className='list-disc ml-6 text-sm text-gray-700 mt-2'>
                        {order?.orderItems
                          .filter((item) => item.sentOverNight)
                          .map((product, index) => (
                            <li key={index}>{product.name}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              <h2 className='mb-4 text-xl font-semibold text-[#0e355e]'>
                Shipping Address
              </h2>
              <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg '>
                <div className='flex flex-col md:flex-row md:justify-between bg-white p-2 rounded-md gap-4 '>
                  <div className='flex flex-1 flex-col'>
                    {order?.shippingAddress?.companyName && (
                      <h3 className='font-bold'>
                        {order?.shippingAddress.companyName},
                      </h3>
                    )}
                    {formatPhoneNumber(order?.shippingAddress?.phone)} <br />
                    {order?.shippingAddress?.address}
                    {order?.shippingAddress?.suiteNumber
                      ? "," + order?.shippingAddress.suiteNumber
                      : ""}{" "}
                    <br /> {order?.shippingAddress?.state},{" "}
                    {order?.shippingAddress?.city},{" "}
                    {order?.shippingAddress?.postalCode}
                  </div>
                  <div className='flex flex-1 flex-col'>
                    <h3 className='font-bold'> Attn to: </h3>
                    {order?.shippingAddress?.contactInfo?.firstName}{" "}
                    {order?.shippingAddress?.contactInfo?.lastName}
                    <br />
                    {order?.shippingAddress?.contactInfo?.email}
                    {order?.shippingAddress?.contactInfo?.secondEmail && (
                      <span>
                        , {order?.shippingAddress?.contactInfo?.secondEmail}
                      </span>
                    )}
                  </div>

                  <div className='flex flex-1 flex-col'>
                    <h3 className='font-bold'>Shipping Instructions</h3>
                    {order?.shippingPreferences?.shippingMethod} -{" "}
                    {order?.shippingPreferences?.carrier}
                    <br />
                    {order?.shippingPreferences?.account && (
                      <span>
                        {" "}
                        Account: {order?.shippingPreferences?.account}
                      </span>
                    )}
                    {order?.shippingPreferences?.paymentMethod && (
                      <span>
                        {" "}
                        Payment Method:{" "}
                        {order?.shippingPreferences?.paymentMethod}
                      </span>
                    )}
                    <div>{order?.shippingAddress?.notes}</div>
                  </div>
                </div>
              </div>

              <button
                className='font-bold text-[#0e355e] hover:text-[#122338] mt-3 transition'
                onClick={() => {
                  setActiveStep(1);
                }}
              >
                Edit
              </button>
            </div>

            <div
              ref={targetRef}
              className='card bg-white shadow-lg p-6 rounded-lg border mt-5 my-5'
            >
              <h2 className='mb-4 text-xl font-semibold text-[#0e355e]'>
                Order Items
              </h2>
              <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg '>
                <div className='flex flex-col md:flex-row md:justify-between bg-white p-2 rounded-md gap-4 '>
                  <div className='w-full space-y-4'>
                    {order.orderItems?.map((item) => (
                      <div
                        key={item._id}
                        className='border rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center'
                      >
                        {/* Product */}
                        <div className='flex items-center space-x-4 mb-4 md:mb-0 md:flex-1'>
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                            className='rounded-lg'
                            loading='lazy'
                          />
                          <div>
                            <Link
                              href={`/products/${item.manufacturer}-${item.name}?pId=${item.productId}`}
                              className='block font-medium text-gray-800'
                            >
                              {item.manufacturer}
                            </Link>
                            <div className='text-gray-600 text-sm'>
                              {item.name}
                            </div>
                          </div>
                        </div>

                        {/* Details grid on mobile; row on md+ */}
                        <div className='grid grid-cols-2 gap-x-4 gap-y-2 flex-1 md:flex md:items-center md:justify-between'>
                          {/* Type */}
                          <div className='flex items-center'>
                            <span className='font-semibold mr-1'>U o M:</span>
                            <span className='text-gray-700'>
                              {item.typeOfPurchase === "Box"
                                ? "Box"
                                : item.typeOfPurchase}
                            </span>
                          </div>

                          {/* Quantity */}
                          <div className='flex items-center'>
                            <span className='font-semibold mr-1'>Qty:</span>
                            <span className='text-gray-700'>
                              {item.quantity}
                            </span>
                          </div>

                          {/* Price */}
                          <div className='flex items-center'>
                            <span className='font-semibold mr-1'>Price:</span>
                            <span className='text-gray-700'>
                              $
                              {new Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(item.price)}
                            </span>
                          </div>
                          <div className='flex items-center'>
                            <span className='font-semibold mr-1'>Total:</span>
                            <span className='text-gray-700'>
                              $
                              {new Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className='font-bold text-[#0e355e] hover:text-[#122338] mt-3 transition'
                onClick={() => {
                  setActiveStep(0);
                }}
              >
                Edit
              </button>
            </div>
          </div>
          <div>
            <div className='mt-3 sticky top-[13rem] bg-white shadow-lg p-6 rounded-lg border'>
              <h2 className='mb-2 text-lg font-semibold'>Order Summary</h2>
              <ul className='text-gray-700'>
                <li className='mb-2 flex justify-between text-lg'>
                  <span>Items</span>
                  <span>
                    {" "}
                    $
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(itemsPrice)}
                  </span>
                </li>
                {isPayByWire && (
                  <li className='mb-2 flex justify-between text-lg text-green-600'>
                    <span>Discount ({WIRE_PAYMENT_DISCOUNT_PERCENTAGE}%)</span>
                    <span>- ${discountAmount.toFixed(2)}</span>
                  </li>
                )}
                <li className='mb-4 flex justify-between text-xl font-bold'>
                  <span>Total</span>
                  <span className='text-[#0e355e]'>
                    {" "}
                    $
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalPrice)}
                  </span>
                </li>
                <li>
                  {order?.paymentMethod === "Stripe" &&
                  order?.shippingPreferences?.paymentMethod !== "Bill Me" ? (
                    <div className='buttons-container text-center mx-auto'>
                      <button
                        onClick={placeOrderHandler}
                        type='button'
                        className='primary-button w-full'
                      >
                        <div className='flex flex-row align-middle justify-center items-center '>
                          Secure Checkout &nbsp; <AiTwotoneLock />
                        </div>

                        <Image
                          src={Stripe}
                          alt='Checkout with Stripe'
                          height={80}
                          width={200}
                          className='mt-2'
                          loading='lazy'
                        />
                      </button>
                    </div>
                  ) : order?.paymentMethod === "PayPal" ? (
                    isPending ? (
                      <div>Loading...</div>
                    ) : (
                      <PayPalButtons
                        className='fit-content mt-3'
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={onError}
                        forceReRender={[totalPrice]}
                      ></PayPalButtons>
                    )
                  ) : order?.paymentMethod === "PO Number" ||
                    order?.paymentMethod === "Pay By Wire" ||
                    (order?.paymentMethod === "Stripe" &&
                      order?.shippingPreferences?.paymentMethod ===
                        "Bill Me") ? (
                    <button
                      disabled={loading}
                      onClick={placeOrderHandler}
                      className='w-full bg-[#0e355e] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#0e3a6e] transition'
                    >
                      {loading ? "Processing..." : "Confirm Order"}
                    </button>
                  ) : null}
                </li>
                {order?.paymentMethod === "Stripe" &&
                order?.shippingPreferences?.paymentMethod === "Bill Me" ? (
                  <li className='mt-3 '>
                    <div className='font-semibold my-2 text-lg items-center text-center'>
                      You selected the &quot;Bill Me&quot; option for the
                      Shipping Payment.
                    </div>
                    <div className='my-2 text-lg items-center text-center'>
                      You will receive an email when your order is ready to
                      ship, and the order with the shipment value included, so
                      you can make the payment.
                    </div>
                  </li>
                ) : (
                  <li className='mt-3 text-gray-600 text-sm'>
                    We will contact you for more information depending on your
                    shipping preference selection.
                  </li>
                )}
              </ul>
              <div className='mt-6 w-full flex justify-center gap-4'>
                <button
                  type='button'
                  className='px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition-all'
                  onClick={() => setActiveStep(2)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
