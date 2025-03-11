import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/main/Layout';
import { getError } from '../utils/error';
import { Store } from '../utils/Store';
import emailjs from '@emailjs/browser';

export default function PlaceOrderScreen() {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { cartItems, shippingAddress, billingAddress, paymentMethod } = cart;
  const WIRE_PAYMENT_DISCOUNT_PERCENTAGE = 1.5;
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const itemsPrice = round2(
    cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  ); // 123.4567 => 123.46

  const isPayByWire = paymentMethod === 'Pay by Wire';
  const discountPercentage = isPayByWire ? WIRE_PAYMENT_DISCOUNT_PERCENTAGE : 0;
  const discountAmount = round2(itemsPrice * (discountPercentage / 100));
  const totalPrice = round2(itemsPrice - discountAmount);

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
  const validateOrder = () => {
    if (
      !shippingAddress ||
      !billingAddress ||
      !paymentMethod ||
      cartItems.length === 0
    ) {
      return false;
    }

    return true;
  };
  const cartItemsWithPrice = cartItems.map(item => ({
  ...item,
  wpPrice: item.wpPrice || item.price, // If missing, use the price as a minimum
}));
  
  const placeOrderHandler = async () => {
    if (!validateOrder()) {
      toast.error('Please fill all required fields.');
      return;
    }
    sendEmail();
    try {
      setLoading(true);
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItemsWithPrice,
        shippingAddress,
        billingAddress,
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
    
  };

  console.log("Cart Items before order:", cartItems);
  return (
    <Layout title="Confirm Order">
      <CheckoutWizard activeStep={3} />
        <h1 className="mb-6 text-2xl font-bold text-[#144e8b] text-center">Confirm Your Order</h1>
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-600 text-lg my-5">
            Your cart is empty.{' '}
            <Link href="/products" className="underline font-bold text-[#144e8b] hover:text-[#0e3a6e] transition">
              Go shopping
            </Link>
          </div>
        ) : (
        <div className="grid md:grid-cols-4 md:gap-6">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card bg-white shadow-lg p-6 rounded-lg border">
              {cartItems && cartItems.some((item) => item.sentOverNight) && (
                <div className="alert-error bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <p className="font-semibold">Important Notice:</p>
                  Some products require overnight shipping due to temperature sensitivity. 
                  It is recommended that some of the products on this order ship
                  overnight. Stat Surgical Supply
                  is not responsible for product damage or failure if you choose
                  another shipping method.
                  <div className="mt-3">
                    <button className="underline font-bold flex flex-row items-center text-[#b91c1c] hover:text-[#991b1b]">
                    Products For Overnight Delivery
                    </button>
                    <ul className="list-disc ml-6 text-sm text-gray-700 mt-2">
                      {cartItems
                      .filter((item) => item.sentOverNight)
                      .map((product, index) => (
                        <li key={index}>{product.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <h2 className="mb-4 text-xl font-semibold text-[#144e8b]">Shipping Address</h2>
              <div className="text-gray-700">
                {shippingAddress.fullName}, 
                {shippingAddress.company && <>{shippingAddress.company},</>}
                {shippingAddress.phone}, {shippingAddress.address},
                {shippingAddress.city}, {shippingAddress.postalCode}
                {shippingAddress.notes && (
                  <div className="mt-3 p-3 bg-gray-100 border-l-4 border-gray-500 rounded-lg">
                    <h3 className="font-bold">Shipping Instructions</h3>
                    <p>{shippingAddress.notes}</p>
                  </div>
                )}
              </div>
              <Link className="underline font-bold text-[#144e8b] hover:text-[#0e3a6e] transition" href="/shipping">
                Edit
              </Link>
            </div>
            <div className="card bg-white shadow-lg p-6 rounded-lg border mt-5">
              <h2 className="mb-4 text-xl font-semibold text-[#144e8b]">Payment Method</h2>
              <p className="text-gray-700">{paymentMethod === 'Stripe' ? 'Credit Card (Powered by Stripe)' : paymentMethod}</p>
              <Link className="underline font-bold text-[#144e8b] hover:text-[#0e3a6e] transition" href="/payment">
                Edit
              </Link>
            </div>
            <div className="card bg-white shadow-lg p-6 rounded-lg border mt-5">
              <h2 className="mb-4 text-xl font-semibold text-[#144e8b]">Order Items</h2>
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-5 py-3 text-left">Item</th>
                    <th className="p-5 text-right">Type</th>
                    <th className="p-5 text-right">Qty</th>
                    <th className="p-5 text-right">Price</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td>
                        <Link href={`/products/${item.slug}`} className="flex items-center p-2">
                          <Image src={item.image} alt={item.slug} width={50} height={50} className="rounded-lg" />
                          <span className="ml-2 font-medium text-gray-700">{item.name}</span>
                        </Link>
                      </td>
                      <td className="p-5 text-right">{item.purchaseType}</td>
                      <td className="p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">${item.price}</td>
                      <td className="p-5 text-right font-bold text-[#144e8b]">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link className="underline font-bold text-[#144e8b] hover:text-[#0e3a6e] transition mt-3 block" href="/cart">
                Edit Cart
              </Link>
            </div>
          </div>
          <div>
          <div className="card bg-white shadow-lg p-6 rounded-lg border my-5">
            <h2 className="mb-4 text-xl font-semibold text-[#144e8b]">Order Summary</h2>
            <ul className="text-gray-700">
              <li className="mb-2 flex justify-between text-lg">
                <span>Items</span>
                <span>${itemsPrice}</span>
              </li>
              {isPayByWire && (
                <li className="mb-2 flex justify-between text-lg text-green-600">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>- ${discountAmount.toFixed(2)}</span>
                </li>
              )}
              <li className="mb-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-[#144e8b]">${totalPrice}</span>
              </li>
              <li>
                <button
                  disabled={loading}
                  onClick={placeOrderHandler}
                  className="w-full bg-[#144e8b] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#0e3a6e] transition"
                >
                  {loading ? 'Processing...' : 'Confirm Order'}
                </button>
              </li>
              <li className="mt-3 text-gray-600 text-sm">
                We will contact you for more information depending on your shipping preference selection.
              </li>
            </ul>
          </div>
        </div>
          <form ref={form} hidden>
            <input type="text" name="user_name" value={emailName} readOnly />
            <input type="text" name="user_phone" value={emailPhone} readOnly />
            <input
              type="text"
              name="total_order"
              value={emailTotalOrder}
              readOnly
            />
            <input
              readOnly
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
              readOnly
            />
            <input type="text" name="user_email" value={email} />
          </form>
      </div>
    )}
  </Layout>
  );
}

PlaceOrderScreen.auth = true;
