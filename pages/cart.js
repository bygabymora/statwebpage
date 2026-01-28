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

      const mergeAddress = (prevAddr, nextAddr) => {
        const safePrev = prevAddr || {};
        const safeNext = nextAddr || {};
        const prevContact = safePrev.contactInfo || {};
        const nextContact = safeNext.contactInfo || {};

        return {
          ...safeNext,
          contactInfo: {
            ...nextContact,
            firstName: nextContact.firstName || prevContact.firstName || "",
            lastName: nextContact.lastName || prevContact.lastName || "",
            email: nextContact.email || prevContact.email || "",
            secondEmail:
              nextContact.secondEmail || prevContact.secondEmail || "",
          },
          companyName: safeNext.companyName || safePrev.companyName || "",
          phone: safeNext.phone || safePrev.phone || "",
          address: safeNext.address || safePrev.address || "",
          state: safeNext.state || safePrev.state || "",
          city: safeNext.city || safePrev.city || "",
          postalCode: safeNext.postalCode || safePrev.postalCode || "",
          suiteNumber: safeNext.suiteNumber || safePrev.suiteNumber || "",
          notes: safeNext.notes || safePrev.notes || "",
        };
      };

      const mergeOrder = (prev, next) => {
        const merged = { ...next };
        merged.shippingAddress = mergeAddress(
          prev?.shippingAddress,
          next?.shippingAddress,
        );
        merged.billingAddress = mergeAddress(
          prev?.billingAddress,
          next?.billingAddress,
        );
        merged.shippingPreferences = {
          ...(next?.shippingPreferences || {}),
          shippingMethod:
            next?.shippingPreferences?.shippingMethod ||
            prev?.shippingPreferences?.shippingMethod ||
            "",
          carrier:
            next?.shippingPreferences?.carrier ||
            prev?.shippingPreferences?.carrier ||
            "",
          account:
            next?.shippingPreferences?.account ||
            prev?.shippingPreferences?.account ||
            "",
          shippingCost:
            next?.shippingPreferences?.shippingCost ||
            prev?.shippingPreferences?.shippingCost ||
            "",
          paymentMethod:
            next?.shippingPreferences?.paymentMethod ||
            prev?.shippingPreferences?.paymentMethod ||
            "",
        };
        return merged;
      };

      // sync state
      setUser(wpUser);
      setOrder((prev) => mergeOrder(prev, freshOrder));

      // if any stock warnings, bail out and show modal
      if (warnings.length) {
        stopLoading();
        const details =
          warnings
            .map((w) =>
              w.availableQuantity === 0 ?
                `${w.name} was removed (out of stock)`
              : `${w.name}: wanted ${w.previousQuantity}, available ${w.availableQuantity}.`,
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
            setOrder((prev) => mergeOrder(prev, freshOrder));
          },
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
      <script
        dangerouslySetInnerHTML={{
          __html: `
     gtag('event', 'ads_conversion_Inicio_de_confirmaci_n__1', {
        value: ${order.totalPrice || 0},
        userName: '${user?.name || ""}',
        userEmail: '${user?.email || ""}',
      });
    `,
        }}
      />

      <CheckoutWizard activeStep={activeStep} />
      {activeStep === 0 ?
        <Cart setActiveStep={setActiveStep} order={order} setOrder={setOrder} />
      : activeStep === 1 ?
        <Shipping
          customer={customer}
          setCustomer={setCustomer}
          order={order}
          setOrder={setOrder}
          setActiveStep={setActiveStep}
          setUser={setUser}
          user={user}
        />
      : activeStep === 2 ?
        <PaymentMethod
          setActiveStep={setActiveStep}
          order={order}
          setOrder={setOrder}
          customer={customer}
          fetchOrder={fetchOrder}
        />
      : activeStep === 3 ?
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
      : null}
    </Layout>
  );
}

CartScreen.usePayPal = true;
