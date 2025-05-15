import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Layout from "../components/main/Layout";
import CheckoutWizard from "../components/CheckoutWizard";
import Shipping from "../components/checkoutProcess/Shipping";
import PaymentMethod from "../components/checkoutProcess/PaymentMethod";
import PlaceOrder from "../components/checkoutProcess/PlaceOrder";
import Cart from "../components/checkoutProcess/Cart";
import { useModalContext } from "../components/context/ModalContext";
import { usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";

export default function CartScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const [order, setOrder] = useState({});
  const { data: session } = useSession();
  const {
    user,
    setUser,
    customer,
    setCustomer,
    startLoading,
    stopLoading,
    openAlertModal,
  } = useModalContext();
  const orderId = Cookies.get("orderId");

  const fetchOrder = async () => {
    startLoading();

    try {
      startLoading();
      axios
        .get("/api/orders/fetchOrLatestInProcess", {
          params: { orderId: Cookies.get("orderId") },
        })
        .then(({ data: { order, wpUser, warnings } }) => {
          setUser(wpUser);
          setOrder(order);

          if (warnings.length) {
            const details = warnings
              .map((w) =>
                w.availableQuantity === 0
                  ? `${w.name} was removed (out of stock)`
                  : `${w.name}: wanted ${w.previousQuantity}, available ${w.availableQuantity}`
              )
              .join("\n");
            const message = {
              title: "Your cart was updated",
              body: `Some items were removed or adjusted due to stock changes:`,
              warning: details,
            };
            const action = () => {
              setUser(wpUser);
              setOrder(order);
            };

            openAlertModal(message, action);
          }
        });
    } catch (err) {
      console.error("❌ fetchOrder() failed:", err);
    } finally {
      stopLoading();
    }
  };

  // On mount, check for an existing orderId cookie and load it
  useEffect(() => {
    if (session && (activeStep === 0 || activeStep === 3)) {
      fetchOrder();
    }
  }, [orderId, session, activeStep]);

  return (
    <Layout title='Cart'>
      {console.log("order", order)}
      {console.log("customer", customer)}
      {console.log("user", user)}
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
          setUser={setUser}
          user={user}
        />
      ) : activeStep === 2 ? (
        <PaymentMethod
          setActiveStep={setActiveStep}
          order={order}
          setOrder={setOrder}
          customer={customer}
          fetchOrder={fetchOrder}
        />
      ) : activeStep === 3 ? (
        <PlaceOrder
          customer={customer}
          setCustomer={setCustomer}
          order={order}
          setOrder={setOrder}
          setUser={setUser}
          user={user}
          setActiveStep={setActiveStep}
          fetchOrder={fetchOrder}
          paypalDispatch={paypalDispatch}
          isPending={isPending}
        />
      ) : null}
    </Layout>
  );
}
CartScreen.usePayPal = true;
