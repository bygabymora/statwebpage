import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useReducer, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import { useSession } from 'next-auth/react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import Stripe from '../../public/images/assets/PBS.png';
import { AiTwotoneLock } from 'react-icons/ai';
import { BsFillArrowDownSquareFill } from 'react-icons/bs';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false, errorPay: action.payload };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false, errorPay: '' };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    case 'AT_COSTUMERS_REQUEST':
      return { ...state, loadingAtCostumers: true };
    case 'AT_COSTUMERS_SUCCESS':
      return { ...state, loadingAtCostumers: false, successAtCostumers: true };
    case 'AT_COSTUMERS_FAIL':
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
  const [showItems, setShowItems] = useState(false);

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
    error: '',
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal');
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [order, orderId, paypalDispatch, successDeliver, successPay]);

  const {
    shippingAddress,
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

  const handleCheckout = async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const stripe = await stripePromise;
      const { checkoutSession } = await axios.post('/api/checkout_sessions', {
        totalPrice: totalPrice,
        orderId: orderId,
      });

      const result = await stripe.redirectToCheckout({
        sessionId: checkoutSession.data.id,
      });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createOrder = (data, actions) => {
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
      .then((orderID) => {
        return orderID;
      });
  };

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Order is paid successfully');

        // Mark payment as complete and show success message
        setPaymentComplete(true);

        // Reload the page after a short delay (e.g., 2 seconds)
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        dispatch({ type: 'PAY_FAIL', payload: getError(error) });
        toast.error(getError(error));
      }
    });
  }
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('paymentSuccess');

    if (paymentSuccess === 'true') {
      const handleOnApprove = async () => {
        try {
          dispatch({ type: 'PAY_REQUEST' });
          const { data } = await axios.put(
            `/api/orders/${order._id}/pay`
            // Include any necessary payload here
          );
          dispatch({ type: 'PAY_SUCCESS', payload: data });
          toast.success('Order is paid successfully');

          // Mark payment as complete and show success message
          setPaymentComplete(true);

          // Remove 'paymentSuccess' from the URL without reloading
          urlParams.delete('paymentSuccess');
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + '?' + urlParams.toString()
          );

          // It will not process payment again since the 'paymentSuccess' query parameter has been removed
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          dispatch({ type: 'PAY_FAIL', payload: getError(error) });
          toast.error(getError(error));
        }
      };

      // Call handleOnApprove here
      handleOnApprove();
    } else {
      console.log('Payment failed');
    }
  }, [order._id]);

  function onError(err) {
    toast.error(getError(err));
  }

  async function deliverOrderHandler(e) {
    e.preventDefault(); // prevent default form submission

    const trackUrl = trackUrlRef.current.value;
    const trackNumber = trackNumberRef.current.value;

    // Validation: Check for whitespace-only strings
    if (!trackUrl.trim() || !trackNumber.trim()) {
      toast.error('Please provide valid inputs.');
      return; // exit function
    }

    try {
      dispatch({ type: 'DELIVER_REQUEST' });

      // Send tracking URL and number with the axios request
      const { data } = await axios.put(
        `/api/admin/orders/${order._id}/deliver`,
        {
          trackUrl: trackUrl,
          trackNumber: trackNumber,
        }
      );

      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is processed');
    } catch (err) {
      dispatch({ type: 'DELIVER_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  }
  async function atCostumersOrderHandler() {
    try {
      dispatch({ type: 'AT_COSTUMERS_REQUEST' });
      const { data } = await axios.put(
        `/api/admin/orders/${order._id}/atcostumers`,
        {}
      );
      dispatch({ type: 'AT_COSTUMERS_SUCCESS', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      dispatch({ type: 'AT_COSTUMERS_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  }

  const handleCallButtonClick = (event) => {
    event.preventDefault();
    if (window.innerWidth >= 400) {
      alert('Our phone number: 813-252-0727');
    } else {
      window.location.href = 'tel:8132520727';
    }
  };

  return (
    <Layout title={`Order ${orderId}`}>
      <h1 className="mb-4 text-xl">{`Order ${orderId
        .substring(orderId.length - 8)
        .toUpperCase()}`}</h1>

      <br />
      <div>
        <h2>Thank you for your order!</h2>
        <p>
          If you have any questions, please reach out to us at &nbsp;
          <a
            href="mailto:sales@statsurgicalsupply.com"
            target="_blank"
            className="font-bold underline"
          >
            sales@statsurgicalsupply.com
          </a>{' '}
          or call us at &nbsp;
          <a
            href="tel:8132520727"
            onClick={handleCallButtonClick}
            className="font-bold underline"
            target="_blank"
          >
            813-252-0727
          </a>
          .
        </p>
      </div>
      <br />
      {orderItems && orderItems.some((item) => item.sentOverNight) && (
        <div className="bg-red-500 text-white p-3">
          It is recomended that this product ships overnight due to temperature
          sensitivity. Stat Surgical Supply is not responsible for product
          damage or failure if the customer chooses another shipping method.
          <div className="mt-2">
            <button
              onClick={() => setShowItems(!showItems)}
              className="underline font-bold flex flex-row align-middle justify-center items-center"
            >
              Products for Overnight Delivery &nbsp;
              <BsFillArrowDownSquareFill />
            </button>
            {showItems &&
              orderItems
                .filter((item) => item.sentOverNight)
                .map((product, index) => <div key={index}>{product.name}</div>)}
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : paymentComplete ? (
        <div className="alert-success">
          Payment completed successfully. Reloading...
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-2">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card  p-3">
              <h2 className="mb-2 text-lg">Shipping Address</h2>
              <div>
                {shippingAddress.fullName},{' '}
                {shippingAddress.company && <>{shippingAddress.company},</>}{' '}
                {shippingAddress.phone}, {shippingAddress.address},{' '}
                {shippingAddress.city}, {shippingAddress.postalCode}{' '}
                {shippingAddress.notes && (
                  <>
                    <br />
                    <h1>Shipping instructions</h1>
                    {shippingAddress.notes}
                  </>
                )}
              </div>
              {isDelivered ? (
                <div className="alert-success">
                  Processed at{' '}
                  <span className="font-bold">
                    {new Date(deliveredAt).toLocaleDateString()}{' '}
                  </span>
                  <br />
                  Track your order &nbsp;
                  <Link
                    href={trackUrl}
                    target="_blank"
                    className="underline font-bold"
                  >
                    CLICK HERE.
                  </Link>
                  <br />
                  Tracking number: &nbsp;
                  <Link
                    href={trackUrl}
                    target="_blank"
                    className="underline font-bold"
                  >
                    {trackNumber}.
                  </Link>
                </div>
              ) : (
                <div className="alert-error">Not processed</div>
              )}
              {isAtCostumers ? (
                <div className="alert-success">
                  At costumers at{' '}
                  <span className="font-bold">
                    {new Date(atCostumersDate).toLocaleDateString()}{' '}
                  </span>
                </div>
              ) : (
                <div className="alert-error">Not at customers yet</div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              {paymentMethod === 'Stripe' ? (
                <div>Credit Card (Powered by Stripe)</div>
              ) : (
                <div>{paymentMethod}</div>
              )}
              {isPaid ? (
                <div className="alert-success">
                  Paid at{' '}
                  <span className="font-bold">
                    {new Date(paidAt).toLocaleDateString()}{' '}
                  </span>
                </div>
              ) : (
                <div className="alert-error">Not paid</div>
              )}
            </div>

            <div className="card overflow-x-auto p-5 mb-2">
              <h2 className="mb-2 text-lg">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">Item</th>
                    <th className="    p-5 text-right">Quantity</th>
                    <th className="p-5 py-2 text-right">Type</th>
                    <th className="  p-5 text-right">Price</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td>
                        <Link
                          href={`/products/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></Image>
                          &nbsp;
                          {item.name}
                        </Link>
                      </td>
                      <td className=" p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">{item.purchaseType}</td>
                      <td className="p-5 text-right">${item.price}</td>
                      <td className="p-5 text-right">
                        ${item.quantity * item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="card p-2">
              <h2 className="mb-2 text-lg">Order Summary</h2>
              <ul>
                <li>
                  <div className="mb-2 px-3 flex justify-between">
                    <div>Items</div>
                    <div>${itemsPrice}</div>
                  </div>
                </li>

                {paymentMethod === 'Pay by Wire' ? (
                  <li>
                    <div className="mb-2 px-3 flex justify-between">
                      <div>Discount</div>
                      <div>- ${discountAmount}</div>
                    </div>
                  </li>
                ) : null}
                <li>
                  <div className="mb-2  px-3 flex justify-between">
                    <div>Total</div>
                    <div>${totalPrice}</div>
                  </div>
                </li>
                {!isPaid && (
                  <li className="buttons-container text-center mx-auto">
                    {paymentMethod === 'Stripe' ? (
                      <form action="/api/checkout_sessions" method="POST">
                        <section>
                          <input hidden name="totalPrice" value={totalPrice} />
                          <input hidden name="orderId" value={orderId} />
                          <button
                            type="submit"
                            role="link"
                            className="primary-button w-full"
                          >
                            <div className="flex flex-row align-middle justify-center items-center ">
                              Checkout &nbsp; <AiTwotoneLock className="" />
                            </div>
                            <Image
                              src={Stripe}
                              alt="Checkout with Stripe"
                              height={80}
                              width={200}
                              className="mt-2"
                            />
                          </button>
                        </section>
                      </form>
                    ) : paymentMethod === 'Pay by Wire' ? (
                      <button
                        className="primary-button w-full"
                        onClick={handleCheckout}
                      >
                        Pay by Wire
                      </button>
                    ) : paymentMethod === 'Paypal' ? (
                      isPending ? (
                        <div>Loading...</div>
                      ) : (
                        <PayPalButtons
                          className="fit-content  mt-3"
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
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
                      method="POST"
                    >
                      <section>
                        <input
                          ref={trackUrlRef}
                          name="trackUrl"
                          placeholder="Tracking URL"
                          className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline m-1"
                          required
                        />
                        <input
                          ref={trackNumberRef}
                          name="trackNumber"
                          placeholder="Tracking Number"
                          className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline m-1"
                          required
                        />
                        <button
                          type="submit"
                          role="link"
                          className="primary-button w-full"
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
                        className="primary-button w-full"
                        onClick={atCostumersOrderHandler}
                      >
                        Order is at customers
                      </button>
                    </li>
                  )}
                <br />
                <li>
                  <div className="mb-2 px-3 flex justify-between">
                    {!session.user.isAdmin && (
                      <div>
                        Shipping is not defined yet, we will contact you to
                        define the better way of shipping
                      </div>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

OrderScreen.auth = true;
export default OrderScreen;
