import React from "react";
import { useState } from "react";
import Layout from "../components/main/Layout";
import CheckoutWizard from "../components/CheckoutWizard";
import Shipping from "../components/checkoutProcess/Shipping";
import PaymentMethod from "../components/checkoutProcess/PaymentMethod";
import PlaceOrder from "../components/checkoutProcess/PlaceOrder";
import Cart from "../components/checkoutProcess/Cart";
export default function CartScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [order, setOrder] = useState({});
  const [customer, setCustomer] = useState({});
  const [user, setUser] = useState({});
  const [hasShippingAddress, setHasShippingAddress] = useState(false);
  const [hasBillingAddress, setHasBillingAddress] = useState(false);

  return (
    <Layout title='Cart'>
      {console.log("order", order)}
      {console.log("customer", customer)}
      {console.log("hasShippingAddress", hasShippingAddress)}
      {console.log("hasBillingAddress", hasBillingAddress)}
      <CheckoutWizard activeStep={activeStep} />
      {activeStep === 0 ? (
        <Cart setActiveStep={setActiveStep} order={order} setOrder={setOrder} />
      ) : activeStep === 1 ? (
        <Shipping
          customer={customer}
          setCustomer={setCustomer}
          order={order}
          setOrder={setOrder}
          setActiveStep={setActiveStep}
          hasShippingAddress={hasShippingAddress}
          setHasShippingAddress={setHasShippingAddress}
          hasBillingAddress={hasBillingAddress}
          setHasBillingAddress={setHasBillingAddress}
          setUser={setUser}
          user={user}
        />
      ) : activeStep === 2 ? (
        <PaymentMethod
          setActiveStep={setActiveStep}
          order={order}
          setOrder={setOrder}
          customer={customer}
        />
      ) : activeStep === 3 ? (
        <PlaceOrder
          customer={customer}
          setCustomer={setCustomer}
          order={order}
          setOrder={setOrder}
          hasShippingAddress={hasShippingAddress}
          setHasShippingAddress={setHasShippingAddress}
          hasBillingAddress={hasBillingAddress}
          setHasBillingAddress={setHasBillingAddress}
          setUser={setUser}
          user={user}
        />
      ) : null}
    </Layout>
  );
}
