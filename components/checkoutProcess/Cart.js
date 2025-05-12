import React, { useEffect } from "react";
import { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BsCartX, BsTrash3 } from "react-icons/bs";
import axios from "axios";
import { Store } from "../../utils/Store";

const Cart = ({ setActiveStep, order, setOrder }) => {
  const [stockAlert, setStockAlert] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!order.orderItems) return;
    const verifyStockOnCartLoad = async () => {
      for (const item of order.orderItems) {
        try {
          const { data } = await axios.get(`/api/products/${item.productId}`);
          let availableQuantity = 0;

          if (item.typeOfPurchase === "Each") {
            availableQuantity =
              data.each?.quickBooksQuantityOnHandProduction ?? 0;
          } else if (item.typeOfPurchase === "Box") {
            availableQuantity =
              data.box?.quickBooksQuantityOnHandProduction ?? 0;
          } else if (item.typeOfPurchase === "Clearance") {
            availableQuantity = data.countInStockClearance ?? 0;
          }

          if (availableQuantity < item.quantity) {
            dispatch({ type: "CART_REMOVE_ITEM", payload: item });
            setStockAlert({
              name: item.name,
              type: item.typeOfPurchase,
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

  const { dispatch } = useContext(Store);
  const [showModal, setShowModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  const removeItemHandler = (item) => {
    setProductToRemove(item);
    setShowModal(true);
  };

  const confirmRemoveItem = () => {
    if (productToRemove) {
      dispatch({ type: "CART_REMOVE_ITEM", payload: productToRemove });
    }
    setShowModal(false);
    setProductToRemove(null);
  };

  const updateCartHandler = async (item, qty) => {
    const quantity = Number(qty);

    const { data } = await axios.get(`/api/products/${item.productId}`);

    if (
      data.typeOfPurchase === "Each" &&
      item.each?.quickBooksQuantityOnHandProduction < quantity
    ) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    if (
      data.typeOfPurchase === "Box" &&
      item.box?.quickBooksQuantityOnHandProduction < quantity
    ) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    if (
      data.typeOfPurchase === "Clearance" &&
      item.countInStockClearance < quantity
    ) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    dispatch({
      type: "CART_UPDATE_ITEM", // Change to a new action type
      payload: { ...item, quantity },
    });

    const itemsPrice = order.orderItems?.reduce(
      (a, c) => a + c.quantity * c.price,
      0
    );

    setOrder({ ...order, orderItems: order.orderItems, itemsPrice });
  };

  if (!mounted) return null;

  return (
    <div className='mx-auto'>
      <h1 className='text-3xl font-bold text-center text-[#144e8b] mb-6'>
        Shopping Cart
      </h1>

      {order.orderItems?.length === 0 ? (
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
        <div className='mt-3 p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg mb-4 grid flex-1 sm:grid-cols-2 md:grid-cols-4 md:gap-5 md:m-4'>
          <div className=' bg-white p-2 rounded-md gap-4 md:col-span-3 '>
            <div className=' '>
              <div className='w-full space-y-4'>
                {order.orderItems?.map((item) => (
                  <div
                    key={item._id}
                    className='border rounded-lg p-4 shadow-sm flex  md:items-center'
                  >
                    {/* Product */}
                    <div className='flex flex-1 items-center  space-x-4 mb-4 md:mb-0 md:flex-1'>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className='rounded-lg'
                        loading='lazy'
                      />
                      <div>
                        <Link
                          href={`/products/${item.manufacturer}-${item.name}-${item._id}`}
                          className='block font-medium text-gray-800'
                        >
                          {item.manufacturer}
                        </Link>
                        <div className='text-gray-600 text-sm'>{item.name}</div>
                      </div>
                    </div>
                    <div className='flex flex-1 flex-col md:flex-row justify-between items-start'>
                      {/* Type */}
                      <div className='flex-1'>
                        <div className='flex flex-1 items-center'>
                          <span className='font-semibold  mr-1'>U o M:</span>
                          <span className='text-gray-700'>
                            {item.typeOfPurchase === "Box"
                              ? "Box"
                              : item.typeOfPurchase}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className='flex flex-1 items-center'>
                          <span className='font-semibold mr-1'>Qty:</span>
                          <select
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartHandler(item, Number(e.target.value))
                            }
                            className='px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline'
                          >
                            {[...Array(item.countInStock || 0).keys()].map(
                              (x) => (
                                <option key={x + 1} value={x + 1}>
                                  {x + 1}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                      {/* Price */}
                      <div className='flex-1'>
                        <div className='flex flex-1 items-center'>
                          <span className='font-semibold mr-1'>Price:</span>
                          <span className='text-gray-700'>
                            $
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(item.price)}
                          </span>
                        </div>
                        <div className='flex flex-1 items-center'>
                          <span className='font-semibold mr-1'>Total:</span>
                          <span className='text-gray-700'>
                            $
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center justify-end md:justify-center'>
                      <button
                        onClick={() => removeItemHandler(item)}
                        className='p-2 hover:bg-gray-100 rounded'
                      >
                        <BsTrash3 className='h-5 w-5 text-gray-600' />
                      </button>
                    </div>

                    {/* Remove */}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className=' bg-white rounded-md gap-4 p-4'>
            <ul>
              <li>
                <div className='pb-3 font-xl'>
                  Subtotal (
                  {order.orderItems?.reduce((a, c) => a + c.quantity, 0)}) {""}:
                  $
                  {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    order.orderItems?.reduce(
                      (a, c) => a + c.quantity * c.price,
                      0
                    )
                  )}
                </div>
              </li>
              <li>
                <button
                  onClick={() => setActiveStep(1)}
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
    </div>
  );
};

export default Cart;
