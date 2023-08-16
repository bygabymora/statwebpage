import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';

export default function PaymentScreen() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress, paymentMethod } = cart;

  const router = useRouter();

  const submitHandler = (e) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      return toast.error('Payment method is required');
    }
    dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: selectedPaymentMethod });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        paymentMethod: selectedPaymentMethod,
      })
    );

    router.push('/placeorder');
  };
  useEffect(() => {
    if (!shippingAddress.address) {
      return router.push('/shipping');
    }
    setSelectedPaymentMethod(paymentMethod || '');
  }, [paymentMethod, router, shippingAddress.address]);

  return (
    <Layout title="Payment Method">
      <CheckoutWizard activeStep={2} />
      <form className="mx-auto max-w-screen-md" onSubmit={submitHandler}>
        <h1 className="mb-4 text-xl">Payment Method</h1>
        <p>
          You get a discount of 1.5% if the payment is done via bank wire
          transfer.
        </p>
        <br />
        <div className="mb-4">
          <input
            name="paymentMethod"
            className="p-2 outline-none focus:ring-0"
            id="Stripe"
            type="radio"
            checked={selectedPaymentMethod === 'Stripe'}
            onChange={() => setSelectedPaymentMethod('Stripe')}
          />
          <label className="p-2" htmlFor="Stripe">
            Credit Card (Powered by Stripe)
          </label>
        </div>
        <div className="mb-4">
          <input
            name="paymentMethod"
            className="p-2 outline-none focus:ring-0"
            id="Paypal"
            type="radio"
            checked={selectedPaymentMethod === 'Paypal'}
            onChange={() => setSelectedPaymentMethod('Paypal')}
          />
          <label className="p-2" htmlFor="Paypal">
            Paypal
          </label>
        </div>

        <div className="mb-4">
          <input
            name="paymentMethod"
            className="p-2 outline-none focus:ring-0"
            id="Pay by Wire"
            type="radio"
            checked={selectedPaymentMethod === 'Pay by Wire'}
            onChange={() => setSelectedPaymentMethod('Pay by Wire')}
          />
          <label className="p-2" htmlFor="Pay by Wire">
            Pay by Wire
          </label>
        </div>

        <div className="mb-4 flex justify-between">
          <button
            onClick={() => router.push('/shipping')}
            type="button"
            className="primary-button"
          >
            Back
          </button>
          <button className="primary-button">Next</button>
        </div>
      </form>
    </Layout>
  );
}

PaymentScreen.auth = true;
