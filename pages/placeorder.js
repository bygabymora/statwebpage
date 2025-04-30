import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import React, { useContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import CheckoutWizard from "../components/CheckoutWizard";
import Layout from "../components/main/Layout";
import { getError } from "../utils/error";
import { Store } from "../utils/Store";
import { useModalContext } from "../components/context/ModalContext";
import { messageManagement } from "../utils/alertSystem/customers/messageManagement";
import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import handleSendEmails from "../utils/alertSystem/documentRelatedEmail";
import { loadStripe } from "@stripe/stripe-js";

export default function PlaceOrderScreen() {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { cartItems, shippingAddress, billingAddress, paymentMethod } = cart;
  const { showStatusMessage } = useModalContext();
  const [loading] = useState(false);
  const form = useRef();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailName, setEmailName] = useState("");
  const [Phone, setPhone] = useState("");
  const [emailTotalOrder, setEmailTotalOrder] = useState("");
  const [emailPaymentMethod, setEmailPaymentMethod] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const stripePromise = useMemo(() => {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      : null;
  }, []);

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const WIRE_PAYMENT_DISCOUNT_PERCENTAGE = 1.5;
  const itemsPrice = useMemo(
    () => round2(cartItems.reduce((a, c) => a + c.quantity * c.price, 0)),
    [cartItems]
  );
  const isPayByWire = paymentMethod === "Pay by Wire";
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

  useEffect(() => {
    setEmail(shippingAddress.email);
    setEmailName(shippingAddress.fullName);
    setPhone(shippingAddress.phone);
    setEmailPaymentMethod(paymentMethod);
    setEmailTotalOrder(totalPrice);
    setSpecialNotes(shippingAddress.notes);
  }, [paymentMethod, shippingAddress, totalPrice]);

  const cartItemsWithPrice = cartItems.map((item) => ({
    ...item,
    wpPrice: item.wpPrice || item.price,
  }));

  const sendEmail = (e = { preventDefault: () => {} }) => {
    e.preventDefault();

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
      total: emailTotalOrder,
      paymentMethod: emailPaymentMethod,
      shippingPreference: specialNotes,
    };

    const emailMessage = messageManagement(
      contactToEmail,
      "Order Confirmation"
    );

    handleSendEmails(emailMessage, contactToEmail);
  };

  const placeOrderHandler = async () => {
    if (!validateOrder()) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!totalPrice || isNaN(totalPrice) || totalPrice <= 0) {
      toast.error("Total price is invalid. Please review your cart.");
      return;
    }

    const currentCartItems = [...cartItemsWithPrice];
    if (!currentCartItems.length) {
      toast.error("Cart is empty.");
      return;
    }

    sendEmail();

    try {
      // Create the order in your backend
      const { data } = await axios.post("/api/orders", {
        orderItems: currentCartItems,
        shippingAddress,
        billingAddress,
        paymentMethod,
        itemsPrice,
        totalPrice,
        discountAmount,
      });

      dispatch({ type: "CART_CLEAR_ITEMS" });
      Cookies.set("cart", JSON.stringify({ ...cart, cartItems: [] }));

      // If the payment method is Stripe, redirect to the Stripe checkout
      if (paymentMethod === "Stripe") {
        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        );

        if (!stripe || typeof stripe.redirectToCheckout !== "function") {
          console.error("Stripe initialization failed:", stripe);
          toast.error("Stripe is not available. Please try again later.");
          return;
        }

        const checkoutSession = await axios.post("/api/checkout_sessions", {
          totalPrice,
          orderId: data._id,
        });

        const result = await stripe.redirectToCheckout({
          sessionId: checkoutSession.data.id,
        });

        if (result.error) {
          toast.error(result.error.message);
        }
      } else {
        // If not Stripe, redirect to normal order page
        router.push(`/order/${data._id}`);
      }
    } catch (error) {
      toast.error(getError(error));
    }
  };
  console.log(
    "Stripe public key:",
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );

  console.log("Cart Items before order:", cartItems);
  return (
    <Layout title='Confirm Order'>
      <CheckoutWizard activeStep={3} />
      <h1 className='mb-6 text-2xl font-bold text-[#144e8b] text-center'>
        Confirm Your Order
      </h1>
      {cartItems.length === 0 ? (
        <div className='text-center text-gray-600 text-lg my-5'>
          Your cart is empty.{" "}
          <Link
            href='/products'
            className='underline font-bold text-[#144e8b] hover:text-[#0e3a6e] transition'
          >
            Go shopping
          </Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-6'>
          <div className='overflow-x-auto md:col-span-3'>
            <div className='card bg-white shadow-lg p-6 rounded-lg border'>
              {cartItems && cartItems.some((item) => item.sentOverNight) && (
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
                      {cartItems
                        .filter((item) => item.sentOverNight)
                        .map((product, index) => (
                          <li key={index}>{product.name}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
              <h2 className='mb-4 text-xl font-semibold text-[#144e8b]'>
                Shipping Address
              </h2>
              <div className='text-gray-700'>
                {shippingAddress.fullName},
                {shippingAddress.company && <>{shippingAddress.company},</>}
                {shippingAddress.phone}, {shippingAddress.address},{" "}
                {shippingAddress.state}, {shippingAddress.city},{" "}
                {shippingAddress.postalCode}, {shippingAddress.suiteNumber},{" "}
                {shippingAddress.email}, {shippingAddress.anotherEmail}
                {shippingAddress.notes && (
                  <div className='mt-3 p-3 bg-gray-100 border-l-4 border-gray-500 rounded-lg'>
                    <h3 className='font-bold'>Shipping Instructions</h3>
                    <p>{shippingAddress.notes}</p>
                  </div>
                )}
              </div>
              <Link
                className='underline font-bold text-[#144e8b] hover:text-[#0e3a6e] transition'
                href='/shipping'
              >
                Edit
              </Link>
            </div>
            <div className='card bg-white shadow-lg p-6 rounded-lg border mt-5'>
              <h2 className='mb-4 text-xl font-semibold text-[#144e8b]'>
                Payment Method
              </h2>
              <p className='text-gray-700'>
                {paymentMethod === "Stripe"
                  ? "Credit Card (Powered by Stripe)"
                  : paymentMethod}
              </p>
              <Link
                className='underline font-bold text-[#144e8b] hover:text-[#0e3a6e] transition'
                href='/payment'
              >
                Edit
              </Link>
            </div>
            <div className='card bg-white shadow-lg p-6 rounded-lg border mt-5 my-5'>
              <h2 className='mb-4 text-xl font-semibold text-[#144e8b]'>
                Order Items
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full border border-gray-300 min-w-[600px]'>
                  <thead className='bg-gray-100 border-b'>
                    <tr>
                      <th className='px-5 py-3 text-left'>Item</th>
                      <th className='p-5 text-right'>Type</th>
                      <th className='p-5 text-right'>Qty</th>
                      <th className='p-5 text-right'>Price</th>
                      <th className='p-5 text-right'>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item._id} className='border-b'>
                        <td>
                          <Link
                            href={`/products/${item.manufacturer}-${item.name}-${item._id}`}
                            className='flex items-center p-2'
                          >
                            <Image
                              src={item.image}
                              alt={item._id}
                              width={50}
                              height={50}
                              className='rounded-lg'
                            />
                            <span className='ml-2 font-medium text-gray-700'>
                              {item.name}
                            </span>
                          </Link>
                        </td>
                        <td className='p-5 text-right'>{item.purchaseType}</td>
                        <td className='p-5 text-right'>{item.quantity}</td>
                        <td className='p-5 text-right'>
                          $
                          {new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.price)}
                        </td>
                        <td className='p-5 text-right font-bold text-[#144e8b]'>
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Link
                className='underline font-bold text-[#144e8b] hover:text-[#0e3a6e] transition mt-3 block'
                href='/cart'
              >
                Edit Cart
              </Link>
            </div>
          </div>
          <div>
            <div className='card bg-white shadow-lg p-6 rounded-lg border my-5'>
              <h2 className='mb-4 text-xl font-semibold text-[#144e8b]'>
                Order Summary
              </h2>
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
                  <span className='text-[#144e8b]'>
                    {" "}
                    $
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalPrice)}
                  </span>
                </li>
                <li>
                  <button
                    disabled={loading}
                    onClick={placeOrderHandler}
                    className='w-full bg-[#144e8b] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#0e3a6e] transition'
                  >
                    {loading ? "Processing..." : "Confirm Order"}
                  </button>
                </li>
                <li className='mt-3 text-gray-600 text-sm'>
                  We will contact you for more information depending on your
                  shipping preference selection.
                </li>
              </ul>
            </div>
          </div>
          <form ref={form} hidden>
            <input
              type='text'
              name='user_name'
              value={emailName ?? ""}
              readOnly
            />
            <input
              type='text'
              name='user_phone'
              value={Phone ?? ""}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type='text'
              name='total_order'
              value={emailTotalOrder ?? ""}
              readOnly
            />
            <input
              readOnly
              type='text'
              name='payment_method'
              value={
                emailPaymentMethod === "Stripe"
                  ? "Credit Card (Powered by Stripe)"
                  : emailPaymentMethod ?? ""
              }
            />
            <input
              type='text'
              name='shipping_preference'
              value={specialNotes ?? ""}
              readOnly
            />
            <input type='text' name='user_email' value={email ?? ""} readOnly />
          </form>
        </div>
      )}
    </Layout>
  );
}

PlaceOrderScreen.auth = true;
