import React, { useState, useEffect } from "react";
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
    showStatusMessage,
  } = useModalContext();

  const fetchOrder = async (extraAction) => {
    startLoading();
    try {
      const {
        data: { order: freshOrder, wpUser, warnings },
      } = await axios.get("/api/orders/fetchOrLatestInProcess");

      // sync state
      setUser(wpUser);
      setOrder(freshOrder);

      // if any stock warnings, bail out and show modal
      if (warnings.length) {
        stopLoading();
        const details =
          warnings
            .map((w) =>
              w.availableQuantity === 0
                ? `${w.name} was removed (out of stock)`
                : `${w.name}: wanted ${w.previousQuantity}, available ${w.availableQuantity}.`
            )
            .join("\n") +
          "\n\n" +
          `Your new items total is $${freshOrder.totalPrice}`;

        openAlertModal(
          {
            title: "Your cart was updated",
            body: "Some items were removed or adjusted due to stock changes, please check the changes in your cart.",
            warning: details,
          },
          () => {
            extraAction && extraAction();
            setUser(wpUser);
            setOrder(freshOrder);
          }
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error("❌ fetchOrder() failed:", err);
      showStatusMessage("error", "Failed to verify stock. Please try again.");
      return false;
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    if (session) {
      fetchOrder();
    } else {
      setOrder({ orderItems: [] });
    }
  }, [session, activeStep]);

  return (
    <Layout title='Cart'>
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
