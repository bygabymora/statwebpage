import React, { useEffect } from "react";
import { useContext, useState } from "react";
import { Store } from "../utils/Store";
import Layout from "../components/main/Layout";
import Link from "next/link";
import Image from "next/image";
import { BsCartX, BsTrash3 } from "react-icons/bs";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import axios from "axios";

function CartScreen() {
  const [stockAlert, setStockAlert] = useState(null);

  useEffect(() => {
    const verifyStockOnCartLoad = async () => {
      for (const item of cartItems) {
        try {
          const { data } = await axios.get(`/api/products/${item._id}`);
          let availableQuantity = 0;

          if (item.purchaseType === "Each") {
            availableQuantity =
              data.each?.quickBooksQuantityOnHandProduction ?? 0;
          } else if (item.purchaseType === "Box") {
            availableQuantity =
              data.box?.quickBooksQuantityOnHandProduction ?? 0;
          } else if (item.purchaseType === "Clearance") {
            availableQuantity = data.countInStockClearance ?? 0;
          }

          if (availableQuantity < item.quantity) {
            dispatch({ type: "CART_REMOVE_ITEM", payload: item });
            setStockAlert({
              name: item.name,
              type: item.purchaseType,
              available: availableQuantity,
            });
          }
        } catch (error) {
          console.error("Stock check failed", error);
        }
      }
    };

    verifyStockOnCartLoad();
  }, []);

  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [showModal, setShowModal] = useState(false);
  const [ProductToRemove, setProductToRemove] = useState(null);

  const {
    cart: { cartItems },
  } = state;

  const removeItemHandler = (item) => {
    setProductToRemove(item);
    setShowModal(true);
  };

  const confirmRemoveItem = () => {
    if (ProductToRemove) {
      dispatch({ type: "CART_REMOVE_ITEM", payload: ProductToRemove });
    }
    setShowModal(false);
    setProductToRemove(null);
  };

  const updateCartHandler = async (item, qty) => {
    const quantity = Number(qty);

    const { data } = await axios.get(`/api/products/${item._id}`);

    if (
      data.purchaseType === "Each" &&
      item.each?.quickBooksQuantityOnHandProduction < quantity
    ) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    if (
      data.purchaseType === "Box" &&
      item.box?.quickBooksQuantityOnHandProduction < quantity
    ) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    if (
      data.purchaseType === "Clearance" &&
      item.countInStockClearance < quantity
    ) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    dispatch({
      type: "CART_UPDATE_ITEM", // Change to a new action type
      payload: { ...item, quantity },
    });
  };
  return (
    <Layout title='Cart'>
      <h1 className='text-2xl font-bold text-[#144e8b] my-2'>Shopping Cart</h1>
      <div className='w-16 h-1 bg-[#03793d] mt-1 rounded-full my-3'></div>
      {cartItems.length === 0 ? (
        <div className='p-6 flex flex-col items-center text-center space-y-4 my-5'>
          <BsCartX className='text-[#144e8b] text-4xl' />
          <p className='text-[#414b53] text-lg font-semibold'>Cart is empty.</p>
          <Link
            href='/products'
            className='text-white bg-[#144e8b] hover:bg-[#788b9b] px-4 py-2 rounded-full font-medium transition'
          >
            Go shopping!
          </Link>
        </div>
      ) : (
        <div className='grid sm:grid-cols-2 md:grid-cols-4 md:gap-5 md:m-4'>
          <div className=' md:col-span-3'>
            <table className='table-auto min-w-full border-collapse border'>
              <thead className='border'>
                <tr>
                  <th className='px-5 border text-left'>Product</th>
                  <th className='p-5 py-2 border text-right'>Type</th>
                  <th className='p-5 py-2 border text-right'>Quantity</th>
                  <th className='p-5 py-2 text-right'>Price</th>
                  <th className='p-5'></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id} className='border'>
                    <td className='p-5 border'>
                      <Link
                        href={`/products/${item.manufacturer}-${item.name}-${item._id}`}
                        className='flex flex-col items-center'
                      >
                        <Image
                          src={item.image}
                          alt={item._id}
                          width={50}
                          height={50}
                          className='mb-1 rounded-lg'
                          loading='lazy'
                        />
                        &nbsp;
                        {item.manufacturer}
                        <br />
                        &nbsp;{item.name}
                      </Link>
                    </td>
                    <td className='p-5 text-right border'>
                      {item.purchaseType === "Box" ? "Box" : item.purchaseType}
                    </td>
                    {item.purchaseType === "Each" && (
                      <td className='p-5 text-right border'>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, Number(e.target.value))
                          }
                        >
                          {[
                            ...Array(
                              item.each?.quickBooksQuantityOnHandProduction
                            ).keys(),
                          ].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {item.purchaseType === "Box" && (
                      <td className='p-5 text-right'>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, Number(e.target.value))
                          }
                        >
                          {[
                            ...Array(
                              item.box?.quickBooksQuantityOnHandProduction
                            ).keys(),
                          ].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {item.purchaseType === "Clearance" && (
                      <td className='p-5 text-right'>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, Number(e.target.value))
                          }
                        >
                          {[...Array(item.countInStockClearance).keys()].map(
                            (x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    )}
                    <td className='p-5 text-right border'>
                      {" "}
                      $
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(item.price)}
                    </td>
                    <td className='p-5 text-center'>
                      <button onClick={() => removeItemHandler(item)}>
                        <BsTrash3 className='h-5 w-5' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='card p-5 mb-4 max-h-60 overflow-y-auto'>
            <ul>
              <li>
                <div className='pb-3 font-xl'>
                  Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}){" "}
                  {""}: $
                  {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
                  )}
                </div>
              </li>
              <li>
                <button
                  onClick={() => router.push("Login?redirect=/shipping")}
                  className='primary-button w-full'
                >
                  Checkout
                </button>
              </li>
            </ul>
          </div>
          {showModal && (
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]'>
              <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm text-center'>
                <h2 className='font-bold text-lg'>Confirm Deletion</h2>
                <p className='text-[#788b9b]'>
                  Are you sure you want to remove this product?
                </p>
                <div className='flex justify-center gap-4 mt-4'>
                  <button
                    className='px-4 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#788b9b] transition'
                    onClick={confirmRemoveItem}
                  >
                    Delete
                  </button>
                  <button
                    className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {stockAlert && (
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]'>
              <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm text-center'>
                <h2 className='font-bold text-lg text-red-600'>Out of Stock</h2>
                <p className='text-[#414b53] mt-2'>
                  Sorry, the product <strong>{stockAlert.name}</strong> (
                  {stockAlert.type}) is no longer available in the quantity you
                  selected.
                </p>
                <p className='mt-2 text-sm text-gray-500'>
                  Current available units: {stockAlert.available}
                </p>
                <button
                  className='mt-4 px-4 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#788b9b] transition'
                  onClick={() => setStockAlert(null)}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
export default dynamic(() => Promise.resolve(CartScreen), {
  ssr: false,
});
