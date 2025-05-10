import React, { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Layout from "../components/main/Layout";
import CheckoutWizard from "../components/CheckoutWizard";
import Shipping from "../components/checkoutProcess/Shipping";
import PaymentMethod from "../components/checkoutProcess/PaymentMethod";
import PlaceOrder from "../components/checkoutProcess/PlaceOrder";
import Cart from "../components/checkoutProcess/Cart";
import { Store } from "../utils/Store";

export default function CartScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [order, setOrder] = useState({});
  const [customer, setCustomer] = useState({});
  const [user, setUser] = useState({});
  const { state } = useContext(Store);
  const orderId = Cookies.get("orderId");
  const {
    cart: { cartItems },
  } = state;
  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${orderId}`);
      let finalOrder = data;
      if (cartItems.length > 0) {
        const itemsPrice = cartItems.reduce(
          (a, c) => a + c.quantity * c.price,
          0
        );
        const updatedItems = cartItems.map((item) => ({
          ...item,
          quickBooksItemIdProduction: item[item.purchaseType.toLowerCase()]
            .quickBooksQuantityOnHandProduction
            ? item[
                item.purchaseType.toLowerCase()
              ].quickBooksQuantityOnHandProduction?.toString()
            : item.quickBooksItemIdProduction,
          unitPrice: item.price,
          typeOfPurchase: item.purchaseType,
          productId: item._id,
        }));
        finalOrder = {
          ...finalOrder,
          orderItems: updatedItems,
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
      Cookies.remove("orderId"); // clear invalid cookie
    }
  };
  // On mount, check for an existing orderId cookie and load it
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [cartItems]);

  return (
    <Layout title='Cart'>
      {console.log("order", order)}
      {console.log("customer", customer)}
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
        />
      ) : null}
    </Layout>
  );
}
