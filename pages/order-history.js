import axios from "axios";
import React, { useEffect, useReducer } from "react";
import Layout from "../components/main/Layout";
import { getError } from "../utils/error";
import formatDateWithMonthInLetters from "../utils/dateWithMonthInLetters";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useModalContext } from "../components/context/ModalContext";
import { FaEye } from "react-icons/fa";
import { BiSolidEdit } from "react-icons/bi";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
function OrderHistoryScreen() {
  const [{ orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: "",
  });
  const {
    showStatusMessage,
    setUser,
    openConfirmModal,
    startLoading,
    stopLoading,
  } = useModalContext();
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        startLoading();
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/history`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      } finally {
        stopLoading();
      }
    };
    fetchOrders();
  }, []);

  const getShippingStatus = (shipping) => {
    if (!shipping) {
      console.error("Missing shipping data");
      return "Error: No Shipping Provided";
    }

    const {
      trackingNumber,
      packingSlip,
      isMaster,
      sendingDate,
      deliveryDate,
      deliveryEstimatedDate,
      finalFileId,
      emailSent,
    } = shipping;

    const statuses = new Set(); // Use Set to prevent duplicate statuses

    // Status: No Tracking Number
    if (!trackingNumber) {
      statuses.add("No Tracking Number");
    }

    // Status: No Packing Slip
    if (
      isMaster &&
      (!packingSlip?.packingSlipItems?.length ||
        packingSlip.packingSlipItems.every((item) => item.quantity === 0))
    ) {
      statuses.add("No Packing Slip");
    }

    // Status: Delivered (takes priority over Has Ship Date and Programmed)
    if (deliveryDate) {
      statuses.add("Has Ship Date | Delivered");
    } else {
      // Status: Has Ship Date (Only if not delivered)
      if (sendingDate) {
        statuses.add("Has Ship Date");
      }

      // Status: Programmed Delivery (Only if not delivered)
      if (deliveryEstimatedDate) {
        statuses.add("Programed");
      }
    }

    // Default status if no other status was added
    if (statuses.size === 0) {
      statuses.add("Created");
    }
    if (finalFileId) {
      statuses.add("Pack Created");
    }
    if (emailSent) {
      statuses.add("Confirmation Sent");
    }

    return Array.from(statuses).join(" | ");
  };

  const shippingsShippmentStatus = (shippings) => {
    if (!shippings || shippings?.length === 0) return "No Shipments Created";
    const shippingStatuses =
      shippings?.map((shipping) => getShippingStatus(shipping)) || [];

    let allReadyToShip = true;
    let allCreated = true;
    let someHasShipDate = false;
    let someCreated = false;

    for (const status of shippingStatuses) {
      if (!status) continue;

      // Check for "Has Ship Date" or "Programed"
      if (!status.includes("Has Ship Date") && !status.includes("Programed")) {
        allReadyToShip = false;
      }

      if (status.includes("Has Ship Date")) {
        someHasShipDate = true;
      }

      // Check for "Created"
      if (!status.includes("Created")) {
        allCreated = false;
      }

      if (status.includes("Created")) {
        someCreated = true;
      }
    }

    // Determine final status

    if (allReadyToShip) return "All Shipments with Ship Date";
    if (someHasShipDate) return "Some Shipments with Ship Date";
    if (allCreated) return "All Shipments Created";
    if (someCreated) return "Some Shipments Created";

    return null;
  };

  const paymentAmountStatus = (invoice) => {
    let status = "";
    invoice.balance === 0 && invoice.quickBooksInvoiceIdProduction
      ? (status = "Paid")
      : invoice.balance === invoice?.totalPrice
      ? (status = "Not Paid")
      : invoice?.balance > 0 &&
        invoice?.balance <
          invoice.totalPrice -
            (invoice?.creditCardFee ? invoice?.creditCardFee : 0)
      ? (status = "Partial Payment")
      : invoice.balance < 0
      ? (status = "Over Payment")
      : (status = "Not Paid");
    return status;
  };

  const dueDateHandler = (order) => {
    const date = new Date(order.createdAt);
    const daysToAdd = parseInt(order.defaultTerm.split(" ")[1]);
    console.log("daysToAdd", daysToAdd);
    date.setDate(date.getDate() + daysToAdd);
    return date;
  };

  const dueDateFinalHandler = (order) => {
    if (order.defaultTerm && order.paymentMethod === "PO Number") {
      const date = dueDateHandler(order);
      return date;
    } else {
      const date = new Date(order.createdAt);
      return date;
    }
  };

  const handleOpenOrder = async (orderId) => {
    const message = {
      title: "Are you sure?",
      body: "This will open the order for you to edit, it will be removed from the order history, and you will be redirected to the cart.",
      warning2: "⚠The available stock migth be affected by this action.⚠",
    };

    const action = async (confirmed) => {
      if (confirmed) {
        startLoading();
        try {
          const { user } = await axios.get(`/api/orders/${orderId}/open`);
          if (user) {
            setUser(user);
          }
          Cookies.set("orderId", orderId);

          showStatusMessage("success", "You can now edit your order");
          router.push("/cart");
        } catch (error) {
          console.error("Error fetching order details:", error);
          stopLoading();
        }
      }
    };
    openConfirmModal(message, action);
  };

  return (
    <Layout title='Order History'>
      <h1 className='mb-4 text-xl'>Order History</h1>

      <div className='overflow-x-auto mb-4'>
        {console.log("orders", orders)}
        <div className='space-y-4'>
          {orders.map((order) => (
            <div
              key={order._id}
              className='border rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 bg-white'
            >
              {/* Universal Grid with Labels */}
              <div className='grid grid-cols-2 md:grid-cols-7 gap-y-4 gap-x-4 text-sm md:text-base items-start'>
                {/* ORDER # */}
                <div>
                  <div className='text-gray-500 text-xs uppercase tracking-wide font-medium mb-1'>
                    ORDER #
                  </div>
                  <div className='text-gray-800 font-semibold'>
                    {order.docNumber}
                  </div>
                </div>

                {/* DATE */}
                <div>
                  <div className='text-gray-500 text-xs uppercase tracking-wide font-medium mb-1'>
                    CREATED ON
                  </div>
                  <div>{formatDateWithMonthInLetters(order.createdAt)}</div>
                </div>
                <div>
                  <div className='text-gray-500 text-xs uppercase tracking-wide font-medium mb-1'>
                    DUE DATE
                  </div>
                  <div>
                    {formatDateWithMonthInLetters(dueDateFinalHandler(order))}
                  </div>
                </div>

                {/* PAID */}
                <div>
                  <div className='text-gray-500 text-xs uppercase tracking-wide font-medium mb-1'>
                    PAYMENT STATUS
                  </div>
                  <div>
                    {order.isPaid
                      ? "Paid"
                      : order.invoice
                      ? paymentAmountStatus(order.invoice)
                      : "Not Paid"}
                  </div>
                  <div>
                    {" "}
                    {order.paymentMethod === "Stripe" ? (
                      <div>
                        Credit Card <br />
                        (Powered by Stripe)
                      </div>
                    ) : (
                      <div>{order.paymentMethod}</div>
                    )}
                    {order.paymentMethod === "PO Number" &&
                      order.defaultTerm && (
                        <div>
                          <span className='font-semibold'>Terms: </span>
                          {order.defaultTerm}
                        </div>
                      )}
                  </div>
                </div>

                {/* PROCESSED */}
                <div className=''>
                  <div className='text-gray-500 text-xs uppercase tracking-wide font-medium mb-1 '>
                    SHIPMENT STATUS
                  </div>
                  <div>
                    {order.invoice && order.invoice?.shippings?.length > 0
                      ? shippingsShippmentStatus(order.invoice?.shippings)
                      : "Shipment Not Processed Yet "}
                  </div>
                </div>

                {/* TOTAL */}
                <div>
                  <div className='text-gray-500 text-xs uppercase tracking-wide font-medium mb-1'>
                    TOTAL
                  </div>
                  <div>
                    $
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(order.totalPrice)}
                  </div>
                </div>
                {/* ACTION */}
                <div className='flex gap-2 h-full justify-center items-center text-center'>
                  <div className='relative group flex justify-center items-center'>
                    <button
                      onClick={() => router.push(`/order/${order._id}`)}
                      className='primary-button'
                    >
                      <FaEye />
                    </button>
                    <span className='absolute bottom-full px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                      Details
                    </span>
                  </div>
                  {!order.invoice && !order.isPaid && (
                    <div className='relative group flex justify-center items-center'>
                      <button
                        onClick={() => handleOpenOrder(order._id)}
                        className='primary-button'
                      >
                        <BiSolidEdit />
                      </button>
                      <span className='absolute bottom-full  px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                        Edit
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

OrderHistoryScreen.auth = true;
export default OrderHistoryScreen;
