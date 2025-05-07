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

  return (
    <Layout title='Cart'>
      {console.log("activeStep", activeStep)}
      {console.log("order", order)}
      <CheckoutWizard activeStep={activeStep} />
      {activeStep === 0 ? (
        <Cart setActiveStep={setActiveStep} order={order} setOrder={setOrder} />
      ) : activeStep === 1 ? (
        <Shipping
          order={order}
          setOrder={setOrder}
          setActiveStep={setActiveStep}
        />
      ) : activeStep === 2 ? (
        <PaymentMethod order={order} setOrder={setOrder} />
      ) : activeStep === 3 ? (
        <PlaceOrder order={order} setOrder={setOrder} />
      ) : null}
    </Layout>
  );
}
