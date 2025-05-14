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
  const { user, setUser, customer, setCustomer } = useModalContext();
  const orderId = Cookies.get("orderId");

  const fetchOrder = async () => {
    try {
      let finalOrder;
      console.log("orderId in cart", orderId);

      const { data } = await axios.get(`/api/orders/fetchOrLatestInProcess`, {
        params: { orderId },
      });
      if (data.order && data.order._id) {
        setUser(data.wpUser);
        finalOrder = data.order;
        Cookies.set("orderId", data._id);
      }

      if (data.wpUser && data.wpUser?.cart?.length > 0) {
        console.log("user cart", data.wpUser?.cart);
        const { data: updatedCart } = await axios.post(
          "/api/cart/updateProducts",
          {
            cartItems: data.wpUser?.cart,
          }
        );
        const itemsPrice = updatedCart.updatedCart.reduce(
          (a, c) => a + c.quantity * c.price,
          0
        );
        const finalItems = updatedCart.updatedCart.map((item) => ({
          ...item,
          totalPrice: item.quantity * item.price,
        }));

        finalOrder = {
          ...finalOrder,
          orderItems: finalItems,
          itemsPrice,
          totalPrice: itemsPrice,
        };
      } else {
        finalOrder = {
          ...finalOrder,
          orderItems: [],
        };
      }
      setOrder(finalOrder);
    } catch (err) {
      console.error("Failed to load saved order:", err);
    }
  };
  // On mount, check for an existing orderId cookie and load it
  useEffect(() => {
    if (session) {
      fetchOrder();
    }
  }, [orderId, session, order.orderItems?.length]);

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
