import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { getError } from '../utils/error';
import { Store } from '../utils/Store';
import { BsFillArrowDownSquareFill } from 'react-icons/bs';
import emailjs from '@emailjs/browser';

export default function PlaceOrderScreen() {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { cartItems, shippingAddress, paymentMethod } = cart;
  const WIRE_PAYMENT_DISCOUNT_PERCENTAGE = 1.5;
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const itemsPrice = round2(
    cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  ); // 123.4567 => 123.46

  const isPayByWire = paymentMethod === 'Pay by Wire';
  const discountPercentage = isPayByWire ? WIRE_PAYMENT_DISCOUNT_PERCENTAGE : 0;
  const discountAmount = round2(itemsPrice * (discountPercentage / 100));
  const totalPrice = round2(itemsPrice - discountAmount);
  const [showItems, setShowItems] = useState(false);

  //----EmailJS----//

  const form = useRef();

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/orders/placeOrder');
      const userData = response.data;

      setEmail(userData.email);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const [email, setEmail] = useState('');
  const [emailName, setEmailName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [emailPaymentMethod, setEmailPaymentMethod] = useState('');
  const [emailTotalOrder, setEmailTotalOrder] = useState('');
  const [emailShippingPreference, setEmailShippingPreference] = useState('');

  useEffect(() => {
    fetchUserData();
    setEmailName(shippingAddress.fullName);
    setEmailPhone(shippingAddress.phone);
    setEmailPaymentMethod(paymentMethod);
    setEmailTotalOrder(totalPrice);
    setEmailShippingPreference(shippingAddress.notes);
  }, [
    paymentMethod,
    shippingAddress.fullName,
    shippingAddress.phone,
    totalPrice,
    shippingAddress.notes,
  ]);

  function sendEmail() {
    const formData = new FormData();

    formData.append('user_name', emailName);
    formData.append('user_phone', emailPhone);
    formData.append('user_email', email);
    formData.append('total_order', emailTotalOrder);
    formData.append('payment_method', emailPaymentMethod);
    formData.append('shipping_preference', emailShippingPreference);

    emailjs
      .sendForm(
        'service_ej3pm1k',
        'template_6z4vqi6',
        form.current,
        'cKdr3QndIv27-P67m'
      )
      .then(
        (result) => {
          console.log('Email sent', result.text);
        },
        (error) => {
          console.log('Error sendingemail', error.text);
        }
      );
  }

  //-----------//
  const router = useRouter();
  useEffect(() => {
    if (!paymentMethod) {
      router.push('/payment');
    }
  }, [paymentMethod, router]);

  const [loading, setLoading] = useState(false);

  const placeOrderHandler = async () => {
    sendEmail();
    try {
      setLoading(true);
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        totalPrice,
        discountAmount,
      });
      setLoading(false);
      dispatch({ type: 'CART_CLEAR_ITEMS' });
      Cookies.set(
        'cart',
        JSON.stringify({
          ...cart,
          cartItems: [],
        })
      );
      router.push(`/order/${data._id}`);
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
    console.log({
      cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
    });
  };

  return (
    <Layout title="Confirm Order">
      <CheckoutWizard activeStep={3} />
      <h1 className="mb-4 text-xl">Confirm Order</h1>
      {cartItems.length === 0 ? (
        <div>
          Cart is empty.{' '}
          <Link href="/products" className="underline font-bold">
            Go shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card  p-5">
              {cartItems && cartItems.some((item) => item.sentOverNight) && (
                <div className="alert-error">
                  It is recommended some of the products on this order are
                  shipped overnight due to temperature sensitivity, please make
                  sure you selected that option. Stat Surgical Supply is not
                  responsible for product damage or failure if the customer
                  chooses another shipping method.
                  <div className="mt-2">
                    <button
                      onClick={() => setShowItems(!showItems)}
                      className="underline font-bold flex flex-row align-middle justify-center items-center"
                    >
                      Products for Overnight Delivery &nbsp;
                      <BsFillArrowDownSquareFill />
                    </button>
                    {showItems &&
                      cartItems
                        .filter((item) => item.sentOverNight)
                        .map((product, index) => (
                          <div key={index}>{product.name}</div>
                        ))}
                  </div>
                </div>
              )}
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
              <div>
                <Link className="underline font-bold" href="/shipping">
                  Edit
                </Link>
              </div>
            </div>
            <div className="card  p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              {paymentMethod === 'Stripe' ? (
                <div>Credit Card (Powered by Stripe)</div>
              ) : (
                <div>{paymentMethod}</div>
              )}
              <div>
                <Link className="underline font-bold" href="/payment">
                  Edit
                </Link>
              </div>
            </div>
            <div className="card overflow-x-auto p-5">
              <h2 className="mb-2 text-lg">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">Item</th>
                    <th className="  p-5 text-right">Type</th>
                    <th className="    p-5 text-right">Quantity</th>

                    <th className="  p-5 text-right">Price</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td>
                        <Link
                          href={`/products/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.slug}
                            width={50}
                            height={50}
                            style={{
                              maxWidth: '100%',
                              height: 'auto',
                            }}
                          ></Image>
                          {item.slug}
                        </Link>
                      </td>
                      <td className="p-5 text-right">{item.purchaseType}</td>
                      <td className=" p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">${item.price}</td>
                      <td className="p-5 text-right">
                        ${item.quantity * item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Link className="underline font-bold" href="/cart">
                  Edit
                </Link>
              </div>
            </div>
          </div>
          <div>
            <div className="card  p-5">
              <h2 className="mb-2 text-lg">Order Summary</h2>
              <ul>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Items</div>
                    <div>${itemsPrice}</div>
                  </div>
                </li>

                {isPayByWire && (
                  <li>
                    <div className="mb-2 flex justify-between">
                      <div>Discount ({discountPercentage}%)</div>
                      <div>- ${discountAmount.toFixed(2)}</div>
                    </div>
                  </li>
                )}
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Total</div>
                    <div>${totalPrice}</div>
                  </div>
                </li>
                <li>
                  <button
                    disabled={loading}
                    onClick={placeOrderHandler}
                    className="primary-button w-full"
                  >
                    {loading ? 'Loading...' : 'Confirm Order'}
                  </button>
                </li>
                <li>
                  <br />
                  <div className="mb-2 flex justify-between">
                    <div>
                      We will contact you to define your shipment according to
                      your shipping preferences.
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <form ref={form} hidden>
            <input type="text" name="user_name" value={emailName} />
            <input type="text" name="user_phone" value={emailPhone} />
            <input type="text" name="total_order" value={emailTotalOrder} />
            <input
              type="text"
              name="payment_method"
              value={
                emailPaymentMethod === 'Stripe'
                  ? 'Credit Card (Powered by Stripe)'
                  : emailPaymentMethod
              }
            />

            <input
              type="text"
              name="shipping_preference"
              value={emailShippingPreference}
            />
            <input type="text" name="user_email" value={email} />
          </form>
        </div>
      )}
    </Layout>
  );
}

PlaceOrderScreen.auth = true;
