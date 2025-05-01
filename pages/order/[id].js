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
import {
  BsTruck,
  BsCreditCard2Back,
  BsBoxSeam,
  BsCurrencyDollar,
} from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "../../public/images/assets/PBS.png";
import { AiTwotoneLock } from "react-icons/ai";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { useModalContext } from "../../components/context/ModalContext";
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
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const { query } = useRouter();
  const orderId = query.id;
  const trackUrlRef = useRef(null);
  const trackNumberRef = useRef(null);

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`);
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
    paidAt,
    isDelivered,
    deliveredAt,
    atCostumersDate,
    isAtCostumers,
    trackNumber,
    trackUrl,
  } = order;
  const discountAmount = itemsPrice * 0.015;

  //----Email----//

  const form = useRef();
  const [message] = useState("");
  const { showStatusMessage } = useModalContext();
  const [email, setEmail] = useState("");
  const [emailName, setEmailName] = useState("");
  const [emailPhone, setEmailPhone] = useState("");
  const [emailTotalOrder, setEmailTotalOrder] = useState("");
  const [emailPaymentMethod, setEmailPaymentMethod] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  useEffect(() => {
    if (order & order.shippingAddress) {
      setEmail(shippingAddress.email);
      setEmailName(shippingAddress.fullName);
      setEmailPhone(shippingAddress.phone);
      setEmailPaymentMethod(paymentMethod);
      setEmailTotalOrder(totalPrice);
      setSpecialNotes(shippingAddress.notes);
    }
  }, [
    paymentMethod,
    order,
    totalPrice,
    shippingAddress.email,
    shippingAddress.fullName,
    shippingAddress.notes,
    shippingAddress.phone,
    sendEmail,
  ]);

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
        console.log("Payment failed");
      }
    }
  }, [order._id, sendEmail]);

  function onError(error) {
    toast.error(getError(error));
  }

  async function deliverOrderHandler(e) {
    e.preventDefault(); // prevent default form submission

    const trackUrl = trackUrlRef.current.value;
    const trackNumber = trackNumberRef.current.value;

    // Validation: Check for whitespace-only strings
    if (!trackUrl.trim() || !trackNumber.trim()) {
      toast.error("Please provide valid inputs.");
      return; // exit function
    }

    try {
      dispatch({ type: "DELIVER_REQUEST" });

      // Send tracking URL and number with the axios request
      const { data } = await axios.put(
        `/api/admin/orders/${order._id}/deliver`,
        {
          trackUrl: trackUrl,
          trackNumber: trackNumber,
        }
      );

      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      toast.success("Order is processed");
    } catch (error) {
      dispatch({ type: "DELIVER_FAIL", payload: getError(error) });
      toast.error(getError(error));
    }
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

  console.log(
    "Stripe public key:",
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );

  return (
    <Layout
      title={`Order ${
        typeof orderId === "string" && orderId.length >= 8
          ? orderId.substring(orderId.length - 8).toUpperCase()
          : ""
      }`}
    >
      <h1 className='mb-4 text-2xl font-bold text-center text-[#144e8b]'>
        Order{" "}
        {orderId ? orderId.substring(orderId.length - 8).toUpperCase() : ""}
      </h1>
      <div className='text-center'>
        <h2 className='text-xl font-semibold text-green-600'>
          Thank you for your order!
        </h2>
        <p className='mt-2 text-gray-700'>
          If you have any questions, contact us at{" "}
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
        </p>
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
            <div className='card p-4'>
              {/* Warning about urgent shipments */}
              {orderItems && orderItems.some((item) => item.sentOverNight) && (
                <div className='alert-error bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg'>
                  <p className='font-semibold'>Important</p>
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
                      {orderItems
                        .filter((item) => item.sentOverNight)
                        .map((product, index) => (
                          <li key={index}>{product.name}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
              {/* Address information */}
              <h2 className='mt-4 mb-2 text-lg flex items-center gap-2'>
                <BsTruck className='text-[#144e8b]' /> Shipping Address
              </h2>
              <div className='bg-gray-100 p-3 rounded-md'>
                {shippingAddress?.fullName},
                {shippingAddress?.company && <>{shippingAddress?.company},</>}
                {shippingAddress?.phone}, {shippingAddress?.address},{" "}
                {shippingAddress?.state}, {shippingAddress?.city},{" "}
                {shippingAddress?.postalCode}, {shippingAddress?.suiteNumber},{" "}
                {shippingAddress?.email}, {shippingAddress?.anotherEmail}
              </div>
              <h2 className='mt-4 mb-2 text-lg flex items-center gap-2'>
                <BsCreditCard2Back className='text-[#144e8b]' /> Billing Address
              </h2>
              <div className='bg-gray-100 p-3 rounded-md'>
                {billingAddress?.fullNameB},
                {billingAddress?.companyB && `${billingAddress?.companyB},`}
                {billingAddress?.phoneB}, {billingAddress?.addressB},
                {billingAddress?.cityB}, {billingAddress?.postalCodeB}
              </div>
              {shippingAddress?.notes && (
                <div className='mt-4'>
                  <h3 className='text-lg font-bold'>
                    📦 Shipping Instructions
                  </h3>
                  <p className='text-gray-700'>{shippingAddress?.notes}</p>
                </div>
              )}
              {/* Order status */}
              <div className='mt-4'>
                {isDelivered ? (
                  <div className='alert-success flex items-center'>
                    <AiOutlineCheckCircle className='text-green-500 text-xl' />
                    Processed at{" "}
                    <span className='font-bold'>
                      {new Date(deliveredAt).toLocaleDateString()}{" "}
                    </span>
                    <br />
                    Track your order &nbsp;
                    <Link
                      href={trackUrl}
                      target='_blank'
                      className='underline font-bold'
                    >
                      CLICK HERE.
                    </Link>
                    <br />
                    Tracking number: &nbsp;
                    <Link
                      href={trackUrl}
                      target='_blank'
                      className='underline font-bold'
                    >
                      {trackNumber}.
                    </Link>
                  </div>
                ) : (
                  <div className='alert-error flex items-center'>
                    <AiOutlineCloseCircle className='text-red-500 text-xl' />{" "}
                    &nbsp; Not Processed
                  </div>
                )}
                {isAtCostumers ? (
                  <div className='alert-success'>
                    At costumers at{" "}
                    <span className='font-bold'>
                      {new Date(atCostumersDate).toLocaleDateString()}{" "}
                    </span>
                  </div>
                ) : (
                  <div className='alert-error flex items-center'>
                    <FaRegBell className='text-red-500 text-xl' /> &nbsp;
                    Delivery Pending
                  </div>
                )}
                <div className='mt-4'>
                  <h2 className='mt-2 text-lg font-bold'>Payment Method</h2>
                  {paymentMethod === "Stripe" ? (
                    <div>Credit Card (Powered by Stripe)</div>
                  ) : (
                    <div>{paymentMethod}</div>
                  )}
                  {isPaid ? (
                    <div className='alert-success'>
                      {paymentMethod === "Pay by Wire"
                        ? "Payment Processed At"
                        : "Paid at"}{" "}
                      <span className='font-bold'>
                        {new Date(paidAt).toLocaleDateString()}{" "}
                      </span>
                    </div>
                  ) : (
                    <div className='alert-error flex items-center'>
                      <BsCurrencyDollar className='text-red-500 text-xl' />{" "}
                      &nbsp; Not Paid
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='card p-5 mt-4 my-5'>
              <h2 className='mb-2 text-lg flex items-center gap-2'>
                <BsBoxSeam className='text-[#144e8b]' /> Order Items
              </h2>
              <div className='overflow-x-auto'>
                <table className='table-auto min-w-[600px] w-full border-collapse border'>
                  <thead className='bg-gray-100'>
                    <tr>
                      <th className='p-3 border text-left'>Item</th>
                      <th className='p-3 border text-center'>Quantity</th>
                      <th className='p-3 border text-center'>Type</th>
                      <th className='p-3 border text-right'>Price</th>
                      <th className='p-3 border text-right'>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item._id} className='border'>
                        <td className='p-3 flex items-center gap-2'>
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item._id || "product"}
                              width={50}
                              height={50}
                              className='rounded'
                              loading='lazy'
                            />
                          ) : (
                            <div className='w-[50px] h-[50px] bg-gray-200 flex items-center justify-center rounded text-sm text-gray-500'>
                              N/A
                            </div>
                          )}
                          {typeof item._id === "string" &&
                          item._id.trim() !== "" ? (
                            <Link
                              href={`/products/${item.name}-${item._id}`}
                              className='text-[#144e8b] font-bold'
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <span
                              className='text-red-500 font-bold'
                              title='Invalid or missing id'
                            >
                              {item.name || "Unnamed Product"}
                            </span>
                          )}
                        </td>
                        <td className='p-3 text-center'>{item.quantity}</td>
                        <td className='p-3 text-center'>{item.purchaseType}</td>
                        <td className='p-3 text-right'>
                          {" "}
                          $
                          {new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.price)}
                        </td>
                        <td className='p-3 text-right'>
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div>
            <div className='card p-5 my-5'>
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
                            hidden
                            name='totalPrice'
                            value={totalPrice}
                            readOnly
                          />
                          <input
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
                {session.user.isAdmin && order.isPaid && !order.isDelivered && (
                  <li>
                    {loadingDeliver && <div>Loading...</div>}
                    <form
                      action={`/api/admin/orders/${order._id}/deliver`}
                      method='POST'
                    >
                      <section>
                        <input
                          ref={trackUrlRef}
                          name='trackUrl'
                          placeholder='Tracking URL'
                          className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline m-1'
                          required
                        />
                        <input
                          ref={trackNumberRef}
                          name='trackNumber'
                          placeholder='Tracking Number'
                          className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline m-1'
                          required
                        />
                        <button
                          type='submit'
                          role='link'
                          className='primary-button w-full'
                          onClick={deliverOrderHandler}
                        >
                          Deliver Order
                        </button>
                      </section>
                    </form>
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
                  <div className='mb-2 px-3 flex justify-between text-center'>
                    {!session.user.isAdmin && (
                      <div>
                        We will contact you for more information depending on
                        your shipping preference selection.
                      </div>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <form ref={form} hidden>
            <input
              type='hidden'
              name='order_id'
              value={orderId.substring(orderId.length - 8).toUpperCase()}
              readOnly
            />
            <input
              type='hidden'
              name='user_name'
              value={shippingAddress.fullName}
              readOnly
            />
            <input
              type='hidden'
              name='user_phone'
              value={shippingAddress.phone}
              readOnly
            />
            <input type='hidden' name='user_email' value={email} readOnly />
            <input
              type='hidden'
              name='total_order'
              value={totalPrice}
              readOnly
            />
            <input
              type='hidden'
              name='payment_method'
              value={paymentMethod}
              readOnly
            />
            <input
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
