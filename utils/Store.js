import React, { createContext, useReducer } from 'react';
import Cookies from 'js-cookie';

export const Store = createContext();

const initialState = {
  cart: Cookies.get('cart')
    ? JSON.parse(Cookies.get('cart'))
    : { cartItems: [], shippingAddress: {} },
  cookieAccepted: Cookies.get('cookieAccepted') || false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'CART_ADD_ITEM': {
      const newItem = action.payload;
      const existingItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );

      if (existingItem) {
        if (existingItem.purchaseType !== newItem.purchaseType) {
          // Create a new line in the cart
          const cartItems = [...state.cart.cartItems, newItem];
          Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
          return { ...state, cart: { ...state.cart, cartItems } };
        } else {
          // Update the existing item's quantity
          const cartItems = state.cart.cartItems.map((item) =>
            item._id === existingItem._id ? newItem : item
          );
          Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
          return { ...state, cart: { ...state.cart, cartItems } };
        }
      } else {
        // Item doesn't exist in the cart, add it
        const cartItems = [...state.cart.cartItems, newItem];
        Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
        return { ...state, cart: { ...state.cart, cartItems } };
      }
    }

    case 'CART_UPDATE_ITEM': {
      const updatedItem = action.payload;
      const cartItems = state.cart.cartItems.map((item) =>
        item._id === updatedItem._id &&
        item.purchaseType === updatedItem.purchaseType
          ? { ...item, quantity: updatedItem.quantity }
          : item
      );

      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));

      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter(
        (item) =>
          item._id !== action.payload._id ||
          (item._id === action.payload._id &&
            item.purchaseType !== action.payload.purchaseType)
      );
      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case 'CART_RESET':
      return {
        ...state,
        cart: {
          cartItems: [],
          shippingAddress: { location: {} },
          paymentMethod: '',
        },
      };
    case 'CART_CLEAR_ITEMS':
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            ...action.payload,
          },
          billingAddress: {
            ...state.cart.billingAddress,
            ...action.payload,
          },
        },
      };
    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: {
          ...state.cart,
          paymentMethod: action.payload,
        },
      };

    case 'ACCEPT_COOKIES':
      Cookies.set('cookieAccepted', true);
      return { ...state, cookieAccepted: true };

    default:
      return state;
  }
}

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};

export default React.memo(StoreProvider);
