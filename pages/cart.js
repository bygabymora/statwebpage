import React, { useState, useEffect, useRef } from "react";
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
    showStatusMessage,
  } = useModalContext();
  const orderId = Cookies.get("orderId");

  const targetRef = useRef(null);

  // 2. In your handler, scroll into view
  const handleScroll = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const fetchOrder = async (fromPlaceOrder) => {
    startLoading();
    try {
      // 1) wait for the API call
      const {
        data: { order: freshOrder, wpUser, warnings },
      } = await axios.get("/api/orders/fetchOrLatestInProcess", {
        params: { orderId: Cookies.get("orderId") },
      });

      // 2) sync state
      setUser(wpUser);
      setOrder(freshOrder);

      // 3) if there are warnings, show modal and bail out
      if (warnings.length) {
        const details = warnings
          .map((w) =>
            w.availableQuantity === 0
              ? `${w.name} was removed (out of stock)`
              : `${w.name}: wanted ${w.previousQuantity}, available ${w.availableQuantity}`
          )
          .join("\n");

        openAlertModal(
          {
            title: "Your cart was updated",
            body: `Some items were removed or adjusted due to stock changes, please check your cart. ${
              fromPlaceOrder ? "and TRY AGAIN." : ""
            }`,
            warning: details,
          },
          () => {
            if (fromPlaceOrder) {
              handleScroll();
            }
            setUser(wpUser);
            setOrder(freshOrder);
          }
        );

        return false;
      }

      // 4) no warnings → all good
      return true;
    } catch (err) {
      console.error("❌ fetchOrder() failed:", err);
      showStatusMessage("error", "Failed to verify stock. Please try again.");
      return false;
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
          targetRef={targetRef}
        />
      ) : null}
    </Layout>
  );
}
CartScreen.usePayPal = true;
