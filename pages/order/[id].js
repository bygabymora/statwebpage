import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { useSession } from "next-auth/react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "../../public/images/assets/PBS.png";
import { AiTwotoneLock } from "react-icons/ai";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { useModalContext } from "../../components/context/ModalContext";
import formatPhoneNumber from "../../utils/functions/phoneModified";
import TrackerStepsBarForCustomer from "../../components/orders/TrackerStepsBarForCustomer";
import formatDateForInput from "../../utils/dateUtils";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false, errorPay: action.payload };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false, errorPay: "" };
    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    case "DELIVER_RESET":
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    case "AT_COSTUMERS_REQUEST":
      return { ...state, loadingAtCostumers: true };
    case "AT_COSTUMERS_SUCCESS":
      return { ...state, loadingAtCostumers: false, successAtCostumers: true };
    case "AT_COSTUMERS_FAIL":
      return { ...state, loadingAtCostumers: false, successAtCostumers: false };

    default:
      return state;
  }
}

function OrderScreen() {
  const { data: session } = useSession();
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [order, setOrder] = useState({});
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const { query } = useRouter();
  const orderId = query.id;
  const [showShippingId, setShowShippingId] = useState(null);
  const form = useRef();
  const [message] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { showStatusMessage } = useModalContext();
  const [email, setEmail] = useState("");
  const [emailName, setEmailName] = useState("");
  const [estimate, setEstimate] = useState({});
  const [invoice, setInvoice] = useState({});
  const [accountOwner, setAccountOwner] = useState({});
  const [emailPhone, setEmailPhone] = useState("");
  const [emailTotalOrder, setEmailTotalOrder] = useState("");
  const [emailPaymentMethod, setEmailPaymentMethod] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [
    { loading, error, successPay, loadingPay, loadingDeliver, successDeliver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
    estimate,
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`);
        console.log("Order data:", data);
        setOrder(data.order);
        setEstimate(data.estimate);
        setInvoice(data.invoice);
        setAccountOwner(data.accountOwner);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) });
      }
    };

    if (!order._id || successPay || successDeliver || order._id !== orderId) {
      fetchOrder();
    }

    if (orderId && !order.isPaid && !window.paypal) {
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
  }, [
    orderId,
    successPay,
    successDeliver,
    paypalDispatch,
    order._id,
    order.isPaid,
  ]);

  const {
    shippingAddress,
    billingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    totalPrice,
    isPaid,
    shippingPreferences,
  } = order;
  const discountAmount = itemsPrice * 0.015;

  //----Email----//

  useEffect(() => {
    if (order & order.shippingAddress) {
      setEmail(shippingAddress.email);
      setEmailName(shippingAddress.fullName);
      setEmailPhone(shippingAddress.phone);
      setEmailPaymentMethod(paymentMethod);
      setEmailTotalOrder(totalPrice);
      setSpecialNotes(shippingAddress.notes);
    }
  }, [paymentMethod, order, totalPrice]);

  const sendEmail = useCallback(() => {
    if (!emailName || !email || !emailTotalOrder || !emailPaymentMethod) {
      showStatusMessage(
        "error",
        "Please fill all the fields before sending the email."
      );
      return;
    }

    const contactToEmail = {
      name: emailName,
      email: email,
      phone: emailPhone,
      total: emailTotalOrder,
      paymentMethod: emailPaymentMethod,
      shippingPreference: specialNotes,
      items: orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const emailmessage = messageManagement(
      contactToEmail,
      "Order Confirmation",
      message
    );

    handleSendEmails(emailmessage, contactToEmail);
  }, [
    emailName,
    email,
    emailPhone,
    emailTotalOrder,
    emailPaymentMethod,
    specialNotes,
    orderItems,
    message,
    showStatusMessage,
    handleSendEmails,
  ]);

  const handleCheckout = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });

      const stripe = await stripePromise;

      if (!stripe || typeof stripe.redirectToCheckout !== "function") {
        console.error("Stripe not initialized correctly:", stripe);
        toast.error("Stripe is not available in this environment.");
        return;
      }

      const { data } = await axios.post("/api/checkout_sessions", {
        totalPrice,
        orderId,
      });

      const result = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(getError(error));
    }
  };

  const createOrder = (data, actions) => {
    if (!actions || !actions.order) {
      toast.error(
        "PayPal SDK is not loaded properly. Please refresh the page."
      );
      return;
    }

    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: totalPrice,
            },
          },
        ],
      })
      .then((orderID) => orderID);
  };

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details
        );
        dispatch({ type: "PAY_SUCCESS", payload: data });
        toast.success("Order is paid successfully");
        sendEmail();

        // Mark payment as complete and show success message
        setPaymentComplete(true);

        // Reload the page after a short delay (e.g., 2 seconds)
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        dispatch({ type: "PAY_FAIL", payload: getError(error) });
        toast.error(getError(error));
      }
    });
  }
  const handlePayment = async () => {
    try {
      dispatch({ type: "PAY_REQUEST" });
      const { data } = await axios.put(
        `/api/orders/${order._id}/pay`
        // Include any necessary payload here
      );
      dispatch({ type: "PAY_SUCCESS", payload: data });
      toast.success("Order is paid successfully");
      sendEmail();

      // Mark payment as complete and show success message
      setPaymentComplete(true);

      // Reload the page after payment success
      window.location.reload();
    } catch (error) {
      dispatch({ type: "PAY_FAIL", payload: getError(error) });
      toast.error(getError(error));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.location?.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get("paymentSuccess");
      if (paymentSuccess === "true") {
        const handleOnApprove = async () => {
          try {
            dispatch({ type: "PAY_REQUEST" });
            const { data } = await axios.put(
              `/api/orders/${order._id}/pay`
              // Include any necessary payload here
            );
            dispatch({ type: "PAY_SUCCESS", payload: data });
            toast.success("Order is paid successfully");

            // Mark payment as complete and show success message
            sendEmail();
            setPaymentComplete(true);

            // Remove 'paymentSuccess' from the URL without reloading
            urlParams.delete("paymentSuccess");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname + "?" + urlParams.toString()
            );

            // It will not process payment again since the 'paymentSuccess' query parameter has been removed
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (error) {
            dispatch({ type: "PAY_FAIL", payload: getError(error) });
            toast.error(getError(error));
          }
        };

        // Call handleOnApprove here
        handleOnApprove();
      } else {
        console.error("Payment failed");
      }
    }
  }, [order._id, sendEmail]);

  function onError(error) {
    toast.error(getError(error));
  }

  async function atCostumersOrderHandler() {
    try {
      dispatch({ type: "AT_COSTUMERS_REQUEST" });
      const { data } = await axios.put(
        `/api/admin/orders/${order._id}/atcostumers`,
        {}
      );
      dispatch({ type: "AT_COSTUMERS_SUCCESS", payload: data });
      toast.success("Order is delivered");
    } catch (error) {
      dispatch({ type: "AT_COSTUMERS_FAIL", payload: getError(error) });
      toast.error(getError(error));
    }
  }

  const handleCallButtonClick = (event) => {
    event.preventDefault();
    if (window.innerWidth >= 400) {
      alert("Our phone number: 813-252-0727");
    } else {
      window.location.href = "tel:8132520727";
    }
  };

  const handleButtonClick = () => {
    handlePayment();
  };

  useEffect(() => {
    if (order.paymentMethod === "PO Number") {
      if (invoice && invoice.status) {
        const finalStatus = invoice.status?.includes("Paid")
          ? "Paid"
          : "Unpaid";
        setPaymentStatus(finalStatus);
      } else {
        setPaymentStatus("Unpaid");
      }
    } else {
      setPaymentStatus(order.paymentStatus);
    }
  }, [invoice, order]);

  const dueDateHandler = (terms) => {
    const date = new Date(order.createdAt);
    const daysToAdd = parseInt(terms.split(" ")[1]);
    console.log("daysToAdd", daysToAdd);
    date.setDate(date.getDate() + daysToAdd);
    return date;
  };
  useEffect(() => {
    if (order.defaultTerm) {
      const date = dueDateHandler(order.defaultTerm);
      setDueDate(date);
    }
  }, [order.defaultTerm]);

  return (
    <Layout
      title={`Order ${
        typeof orderId === "string" && orderId.length >= 8
          ? orderId.substring(orderId.length - 8).toUpperCase()
          : ""
      }`}
    >
      <div className='flex-1 bg-white rounded-lg p-2 flex flex-col md:flex-row'>
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold text-[#07783e] text-center p-3'>
            Thank you for your order!
          </h1>
          <div className='text-center font-semibold text-[#144e8b] text-xl'>
            Any information regarding your order <br /> can be provided by your
            Stat Rep.
          </div>
        </div>
      </div>
      <div className='mt-4 bg-white shadow-lg p-6 rounded-lg border'>
        <div className='mt-3 flex-1 p-3 flex flex-col md:flex-row bg-gray-100 border-l-4 border-[#03793d] rounded-lg '>
          <div className='flex-1'>
            <div className='flex items-start'>
              <div className='text-2xl font-bold text-[#144e8b]'>
                Order #{order.docNumber}
              </div>
              {invoice && invoice.docNumber && (
                <div className='mb-4 text-2xl font-bold text-[#144e8b]'>
                  - Invoice #{invoice.docNumber}
                </div>
              )}
            </div>
            <div>
              <h2 className='text-lg font-bold'>Payment Method</h2>
              {paymentMethod === "Stripe" ? (
                <div>Credit Card (Powered by Stripe)</div>
              ) : paymentMethod === "PO Number" ? (
                <div>
                  {paymentMethod} - {order.poNumber}
                </div>
              ) : (
                <div>{paymentMethod}</div>
              )}
              {order.defaultTerm && (
                <div>
                  <span className='font-semibold'>Terms: </span>
                  {order.defaultTerm}
                </div>
              )}
            </div>
          </div>
          <div className='flex-1 flex gap-2 flex-col'>
            <h2 className='text-lg px-1 font-bold'>Stat Rep:</h2>
            <div className='p-4 bg-white rounded-lg text-[#144e8b] font-semibold'>
              {accountOwner?.name}
              <br />
              <a href={`mailto:${accountOwner?.email}`} className='underline'>
                {accountOwner?.email}
              </a>
              <br />
              <a
                href={`tel:${accountOwner?.phone}`}
                className='underline cursor-pointer'
              >
                {formatPhoneNumber(accountOwner?.phone)}
              </a>
            </div>
          </div>
        </div>

        <div className='flex flex-col md:flex-row gap-4'>
          <div className='mt-3 flex-1 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg '>
            <h2 className='text-lg font-bold'>Shipping Status</h2>
            {invoice && invoice.shippings?.length > 0 ? (
              <div className='flex items-center gap-2'>
                {invoice.shippings?.map((shipping) => (
                  <div key={shipping._id}>
                    <TrackerStepsBarForCustomer
                      shipping={shipping}
                      setShowShippingId={setShowShippingId}
                      showShippingId={showShippingId}
                      groupName='Group1'
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-4 bg-white rounded-lg text-center text-[#144e8b] font-semibold'>
                Not shipped yet
              </div>
            )}
          </div>
          <div className='mt-3 flex-1 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg '>
            <h2 className='text-lg font-bold'>Payment Status</h2>
            <div className='p-4 bg-white flex flex-col md:flex-row rounded-lg text-center text-[#144e8b] font-semibold'>
              <div className='flex-1'>
                <span className='font-semibold'>Due Date: </span>
                {formatDateForInput(dueDate)}
              </div>
              <div className='flex-1'>{paymentStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading and error messages */}
      {loading ? (
        <div className='alert-info'>Loading...</div>
      ) : error ? (
        <div className='alert-error'>{error}</div>
      ) : paymentComplete ? (
        <div className='alert-success flex items-center gap-2'>
          <AiOutlineCheckCircle className='text-green-500 text-2xl' />
          Payment completed successfully. Reloading...
        </div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-4'>
          <div className='overflow-x-auto md:col-span-3'>
            <div className=''>
              <div className='mt-4 bg-white shadow-lg p-6 rounded-lg border'>
                <h2 className='mb-4 text-xl font-semibold text-[#144e8b]'>
                  Shipping Instructions
                </h2>
                {orderItems &&
                  orderItems.some((item) => item.sentOverNight) && (
                    <div className='alert-error bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg'>
                      <p className='font-semibold'>Important Notice:</p>
                      Some products require overnight shipping due to
                      temperature sensitivity. It is recommended that some of
                      the products on this order ship overnight. Stat Surgical
                      Supply is not responsible for product damage or failure if
                      you choose another shipping method.
                      <div className='mt-3'>
                        <button className='underline font-bold flex flex-row items-center text-[#b91c1c] hover:text-[#991b1b]'>
                          Products For Overnight Delivery
                        </button>
                        <ul className='list-disc ml-6 text-sm text-gray-700 mt-2'>
                          {orderItems
                            .filter((item) => item.sentOverNight)
                            .map((product, index) => (
                              <li key={index}>{product.name}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}
                <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg '>
                  <div>
                    <span className='font-semibold'>Speed and Carrier: </span>
                    {shippingPreferences.shippingMethod} -{" "}
                    {shippingPreferences.carrier}
                  </div>
                  {shippingPreferences.account && (
                    <div>
                      <span className='font-semibold'> Account: </span>{" "}
                      {shippingPreferences.account}
                    </div>
                  )}
                  {shippingPreferences.paymentMethod && (
                    <div>
                      <span className='font-semibold'>Payment Method: </span>
                      {shippingPreferences.paymentMethod}
                    </div>
                  )}
                  <div>{shippingAddress.notes}</div>
                </div>
              </div>
              <div className='flex flex-col md:flex-row gap-2 my-4'>
                {/* Address information */}
                <div className='flex-1 bg-white shadow-lg p-6 rounded-lg border'>
                  <h2 className='mb-4 text-xl font-semibold text-[#144e8b]'>
                    Shipping Address
                  </h2>
                  <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg '>
                    <div className='flex flex-col md:flex-row md:justify-between bg-white p-2 rounded-md gap-4 '>
                      <div className='flex flex-1 flex-col'>
                        {shippingAddress.companyName && (
                          <h3 className='font-bold'>
                            {shippingAddress.companyName},
                          </h3>
                        )}
                        {formatPhoneNumber(shippingAddress.phone)} <br />
                        {shippingAddress.address}
                        {shippingAddress.suiteNumber
                          ? "," + shippingAddress.suiteNumber
                          : ""}{" "}
                        <br /> {shippingAddress.state}, {shippingAddress.city},{" "}
                        {shippingAddress.postalCode}
                      </div>
                      <div className='flex flex-1 flex-col'>
                        <h3 className='font-bold'> Attn to: </h3>
                        {shippingAddress.contactInfo?.firstName}{" "}
                        {shippingAddress.contactInfo?.lastName}
                        <br />
                        {shippingAddress.contactInfo?.email}
                        {shippingAddress.contactInfo?.secondEmail && (
                          <span>
                            , {shippingAddress.contactInfo?.secondEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex-1 bg-white shadow-lg p-6 rounded-lg border'>
                  <h2 className='mb-4 text-xl font-semibold text-[#144e8b]'>
                    Billing Address
                  </h2>
                  <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg '>
                    <div className='flex flex-col md:flex-row md:justify-between bg-white p-2 rounded-md gap-4 '>
                      <div className='flex flex-1 flex-col'>
                        {billingAddress.companyName && (
                          <h3 className='font-bold'>
                            {billingAddress.companyName},
                          </h3>
                        )}
                        {formatPhoneNumber(billingAddress.phone)} <br />
                        {billingAddress.address}
                        {billingAddress.suiteNumber
                          ? "," + billingAddress.suiteNumber
                          : ""}{" "}
                        <br /> {billingAddress.state}, {billingAddress.city},{" "}
                        {billingAddress.postalCode}
                      </div>
                      <div className='flex flex-1 flex-col'>
                        <h3 className='font-bold'> AP Contact: </h3>
                        {billingAddress.contactInfo?.firstName}{" "}
                        {billingAddress.contactInfo?.lastName}
                        <br />
                        {billingAddress.contactInfo?.email}
                        {billingAddress.contactInfo?.secondEmail && (
                          <span>
                            , {billingAddress.contactInfo?.secondEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-white shadow-lg p-6 rounded-lg border mt-5 my-5'>
              <h2 className='mb-4 text-xl font-semibold text-[#144e8b]'>
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
                              href={`/products/${item.manufacturer}-${item.name}-${item._id}`}
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
            </div>
          </div>
          <div>
            <div className='mt-4 sticky top-[13rem] bg-white shadow-lg p-6 rounded-lg border'>
              <h2 className='mb-2 text-lg font-semibold'>Order Summary</h2>
              <ul>
                <li className='mb-2 flex justify-between'>
                  <span>Items</span>
                  <span>${itemsPrice.toFixed(2)}</span>
                </li>
                {paymentMethod === "Pay by Wire" ? (
                  <li>
                    <div className='mb-2 px-3 flex justify-between'>
                      <div>Discount</div>
                      <div>- ${discountAmount.toFixed(2)}</div>
                    </div>
                  </li>
                ) : null}
                <li>
                  <div className='mb-2  px-3 flex justify-between'>
                    <div>Total</div>
                    <div>
                      $
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totalPrice)}
                    </div>
                  </div>
                </li>
                {!isPaid && (
                  <li className='buttons-container text-center mx-auto'>
                    {paymentMethod === "Stripe" ? (
                      <form action='/api/checkout_sessions' method='POST'>
                        <section>
                          <input
                            autoComplete='off'
                            hidden
                            name='totalPrice'
                            value={totalPrice}
                            readOnly
                          />
                          <input
                            autoComplete='off'
                            hidden
                            name='orderId'
                            value={orderId}
                            readOnly
                          />
                          <button
                            type='submit'
                            role='link'
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
                        </section>
                      </form>
                    ) : paymentMethod === "Pay by Wire" ? (
                      <div>
                        {session.user.isAdmin && (
                          <button
                            className='primary-button w-full'
                            onClick={handleButtonClick}
                          >
                            Mark as paid
                          </button>
                        )}
                        {!session.user.isAdmin && (
                          <div>
                            <button
                              onClick={
                                paymentMethod !== "Pay by Wire" &&
                                handleCheckout
                              }
                              hidden
                            >
                              ...
                            </button>
                            <div className='font-bold'>
                              Thank you for taking advantage of our Pay by Wire
                              discount. We will contact you via email with our
                              account information so you can initiate the
                              transfer.
                            </div>
                          </div>
                        )}
                      </div>
                    ) : paymentMethod === "Paypal" ? (
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
                    ) : null}
                    {loadingPay && <div>Loading...</div>}
                  </li>
                )}

                {session.user.isAdmin &&
                  order.isPaid &&
                  order.isDelivered &&
                  !order.isAtCostumers && (
                    <li>
                      {loadingDeliver && <div>Loading...</div>}
                      <button
                        className='primary-button w-full'
                        onClick={atCostumersOrderHandler}
                      >
                        Order is at customers
                      </button>
                    </li>
                  )}
                <br />
                <li>
                  <div className='flex-1'>
                    If you have any furter questions, you can contact us at{" "}
                    <a
                      href='mailto:sales@statsurgicalsupply.com'
                      target='_blank'
                      className='font-bold underline text-[#144e8b]'
                    >
                      sales@statsurgicalsupply.com
                    </a>{" "}
                    or call us at{" "}
                    <a
                      href='tel:8132520727'
                      onClick={handleCallButtonClick}
                      className='font-bold underline text-[#144e8b]'
                      target='_blank'
                    >
                      813-252-0727
                    </a>
                    .
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <form ref={form} hidden>
            <input
              autoComplete='off'
              type='hidden'
              name='order_id'
              value={orderId.substring(orderId.length - 8).toUpperCase()}
              readOnly
            />
            <input
              autoComplete='off'
              type='hidden'
              name='user_name'
              value={shippingAddress.fullName}
              readOnly
            />
            <input
              autoComplete='off'
              type='hidden'
              name='user_phone'
              value={shippingAddress.phone}
              readOnly
            />
            <input
              autoComplete='off'
              type='hidden'
              name='user_email'
              value={email}
              readOnly
            />
            <input
              autoComplete='off'
              type='hidden'
              name='total_order'
              value={totalPrice}
              readOnly
            />
            <input
              autoComplete='off'
              type='hidden'
              name='payment_method'
              value={paymentMethod}
              readOnly
            />
            <input
              autoComplete='off'
              type='hidden'
              name='shipping_preference'
              value={shippingAddress.notes}
              readOnly
            />
          </form>
        </div>
      )}
    </Layout>
  );
}

OrderScreen.auth = true;
OrderScreen.usePayPal = true;
export default OrderScreen;
