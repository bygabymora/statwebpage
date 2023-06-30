import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import CheckoutWizard from '../components/CheckoutWizard';
import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function ShippingScreen() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const router = useRouter();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress } = cart;

  useEffect(() => {
    setValue('fullName', shippingAddress.fullName);
    setValue('address', shippingAddress.address);
    setValue('city', shippingAddress.city);
    setValue('postalCode', shippingAddress.postalCode);
  }, [setValue, shippingAddress]);

  const submitHandler = ({ fullName, address, city, postalCode }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: { fullName, address, city, postalCode },
    });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        shippingAddress: {
          fullName,
          address,
          city,
          postalCode,
        },
      })
    );

    router.push('/payment');
  };

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1}></CheckoutWizard>
      <form
        className="mx-auto max-w-screen-md w-full "
        onSubmit={handleSubmit(submitHandler)}
      >
        <div>
          <h1 className="text-2xl font-bold">Shipping Address</h1>
          <br />
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="fullName">Full Name</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="fullName"
            placeholder="Enter Full Name"
            {...register('fullName', { required: true, minLength: 3 })}
            autoFocus
            autoCapitalize="true"
            required
          ></input>
          {errors.fullName && (
            <p className="text-red-500">Full Name is required.</p>
          )}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="adress">Address</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="adress"
            placeholder="Enter adress"
            {...register('adress', { required: true, minLength: 3 })}
            autoCapitalize="true"
            required
          ></input>
          {errors.address && (
            <p className="text-red-500">Address is required.</p>
          )}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="state">State</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="state"
            placeholder="Enter state"
            {...register('state', { required: true, minLength: 3 })}
            autoCapitalize="true"
            required
          ></input>
          {errors.state && <p className="text-red-500">State is required.</p>}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="city">City</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="city"
            placeholder="Enter city"
            {...register('city', { required: true, minLength: 3 })}
            autoCapitalize="true"
            required
          ></input>
          {errors.city && <p className="text-red-500">City is required.</p>}
        </div>
        <div className="mb-4 contact__form-div">
          <label htmlFor="postalCode">Postal Code</label>
          <input
            className="w-full contact__form-input"
            type="text"
            id="postalCode"
            placeholder="Enter postal code"
            {...register('postalCode', { required: true, minLength: 3 })}
            autoCapitalize="true"
            required
          ></input>
          {errors.postalCode && (
            <p className="text-red-500">Postal Code is required.</p>
          )}
        </div>
        <div className="mb-4 contact__form-div">
          <button className="primary-button w-full" type="submit">
            Continue
          </button>
        </div>
      </form>
    </Layout>
  );
}

ShippingScreen.auth = true;
