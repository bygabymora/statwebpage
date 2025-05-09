import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import CheckoutWizard from "../components/CheckoutWizard";
import Layout from "../components/main/Layout";
import { Store } from "../utils/Store";

export default function PaymentScreen() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress, paymentMethod } = cart;

  const router = useRouter();

  const submitHandler = (e) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      return toast.error("Please select a payment method");
    }
    dispatch({ type: "SAVE_PAYMENT_METHOD", payload: selectedPaymentMethod });
    Cookies.set(
      "cart",
      JSON.stringify({
        ...cart,
        paymentMethod: selectedPaymentMethod,
      })
    );

    router.push("/placeorder");
  };

  useEffect(() => {
    if (!shippingAddress.address) {
      router.push("/shipping");
    }
    setSelectedPaymentMethod(paymentMethod || "");
  }, [paymentMethod, router, shippingAddress.address]);

  return (
    <Layout title='Payment Method'>
      <CheckoutWizard activeStep={2} />
      <div className='mx-auto max-w-lg bg-white shadow-lg rounded-2xl p-6 my-5'>
        <h1 className='text-2xl font-semibold text-center text-[#144e8b] mb-4'>
          Select a Payment Method
        </h1>
        <p className='text-gray-600 text-center mb-6'>
          Get a <span className='font-bold'>1.5% discount</span> when you pay
          via bank wire transfer.
        </p>

        <form className='space-y-4' onSubmit={submitHandler}>
          {["Stripe", "Paypal", "Pay by Wire"].map((method) => (
            <label
              key={method}
              htmlFor={method}
              className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${
                selectedPaymentMethod === method
                  ? "border-[#03793d] bg-green-50 shadow-md"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className='flex items-center space-x-4'>
                <input
                  autoComplete='off'
                  name='paymentMethod'
                  id={method}
                  type='radio'
                  className='hidden'
                  checked={selectedPaymentMethod === method}
                  onChange={() => setSelectedPaymentMethod(method)}
                />
                <div
                  className={`w-5 h-5 flex items-center justify-center border-2 rounded-full transition-all ${
                    selectedPaymentMethod === method
                      ? "border-[#03793d] bg-[#03793d]"
                      : "border-gray-400"
                  }`}
                >
                  {selectedPaymentMethod === method && (
                    <div className='w-2.5 h-2.5 bg-white rounded-full'></div>
                  )}
                </div>
                <span className='text-lg font-medium text-gray-800'>
                  {method === "Stripe"
                    ? "Credit Card (Powered by Stripe)"
                    : method}
                </span>
              </div>
            </label>
          ))}

          <div className='mt-6 flex justify-between'>
            <button
              type='button'
              className='px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition-all'
              onClick={() => router.push("/shipping")}
            >
              Back
            </button>
            <button
              className='px-6 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#788b9b] transition-all'
              type='submit'
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

PaymentScreen.auth = true;
