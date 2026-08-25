import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import Cookies from "js-cookie";
import CustomAlertModal from "../main/CustomAlertModal";
import { useSession } from "next-auth/react";
import axios from "axios";
import CustomConfirmModal from "../main/CustomConfirmModal";
import Loading from "../main/Loading";

const ModalContext = createContext();
export const useModalContext = () => useContext(ModalContext);

const GUEST_CART_COOKIE = "guestCart";

const readGuestCartCookie = () => {
  try {
    const raw = Cookies.get(GUEST_CART_COOKIE);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGuestCartCookie = (cart) => {
  Cookies.set(GUEST_CART_COOKIE, JSON.stringify(cart), { expires: 30 });
};

export const ModalProvider = ({ children }) => {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [alertMessage, setAlertMessage] = useState({});
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertAction, setAlertAction] = useState(null);
  const [modalMessage, setModalMessage] = useState({});
  const [contact, setContact] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [user, setUser] = useState({});
  const [accountOwner, setAccountOwner] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [guestCart, setGuestCart] = useState([]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [customer, setCustomer] = useState({});

  // Guest cart is cookie-backed so it survives across page loads pre-login.
  useEffect(() => {
    setGuestCart(readGuestCartCookie());
  }, []);

  const addToGuestCart = useCallback(
    (productId, typeOfPurchase, quantity, price) => {
      setGuestCart((prev) => {
        const index = prev.findIndex(
          (item) =>
            item.productId === productId &&
            item.typeOfPurchase === typeOfPurchase,
        );
        const next =
          index >= 0 ?
            prev.map((item, i) =>
              i === index ?
                { ...item, quantity: item.quantity + Number(quantity), price }
              : item,
            )
          : [
              ...prev,
              { productId, typeOfPurchase, quantity: Number(quantity), price },
            ];
        saveGuestCartCookie(next);
        return next;
      });
    },
    [],
  );

  const updateGuestCartItem = useCallback(
    (productId, typeOfPurchase, quantity) => {
      setGuestCart((prev) => {
        const next = prev.map((item) =>
          (
            item.productId === productId &&
            item.typeOfPurchase === typeOfPurchase
          ) ?
            { ...item, quantity: Number(quantity) }
          : item,
        );
        saveGuestCartCookie(next);
        return next;
      });
    },
    [],
  );

  const removeFromGuestCart = useCallback((productId, typeOfPurchase) => {
    setGuestCart((prev) => {
      const next = prev.filter(
        (item) =>
          item.productId !== productId ||
          item.typeOfPurchase !== typeOfPurchase,
      );
      saveGuestCartCookie(next);
      return next;
    });
  }, []);

  const clearGuestCart = useCallback(() => {
    Cookies.remove(GUEST_CART_COOKIE);
    setGuestCart([]);
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        setContact(session.user);
        const { userData, customerData, accountOwner } = await fetchUserData();
        let mergedUserData = userData;

        // Merge any pre-login guest cart into the account's cart, then clear it.
        const pendingGuestCart = readGuestCartCookie();
        if (userData?._id && pendingGuestCart.length > 0) {
          for (const item of pendingGuestCart) {
            try {
              await axios.post(`/api/users/${userData._id}/cart`, {
                productId: item.productId,
                typeOfPurchase: item.typeOfPurchase,
                quantity: item.quantity,
                price: item.price,
                wpPrice: item.price,
                unitPrice: item.price,
              });
            } catch (error) {
              console.error("Failed to merge guest cart item:", error);
            }
          }
          clearGuestCart();
          const refreshed = await fetchUserData();
          mergedUserData = refreshed.userData;
        }

        setUser(mergedUserData);
        setCustomer(customerData);
        setAccountOwner(accountOwner || null);
        setHasSeenModal(false); // Reset the state of the modal when the session changes
      }
    };
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchUserData = async () => {
    const response = await axios.get(`/api/users/${session?.user?._id}`);
    const userData = response.data.wpUser;
    const customerData = response.data.customer;
    const accountOwner = response.data.accountOwner;
    return { userData, customerData, accountOwner };
  };

  const openAlertModal = (message, action) => {
    if (!hasSeenModal) {
      setAlertMessage(message);
      setAlertAction(() => action);
      setIsAlertVisible(true);
      setHasSeenModal(true); // Marks that the modal has already been shown in this session
    }
  };

  const handleAlertConfirm = () => {
    setIsAlertVisible(false);
    if (alertAction) alertAction(); // Execute the action associated with the modal
    setHasSeenModal(true); // Reset the state of the modal
  };

  const showStatusMessage = useCallback((type, message, mode) => {
    setStatusMessage(message);
    setMessageType(type);
    setIsVisible(true);
    if (mode !== "warning" || !mode) {
      setTimeout(() => {
        setIsVisible(false);
        setStatusMessage("");
      }, 5000);
    }
  }, []);

  const openConfirmModal = (message, action) => {
    setIsConfirmModalOpen(true);
    setModalMessage(message);
    setConfirmAction(() => action);
  };

  const handleConfirmationModalConfirm = () => {
    setIsConfirmModalOpen(false);
    confirmAction(true);
    setConfirmAction(null);
  };

  const handleConfirmationModalCancel = () => {
    setIsConfirmModalOpen(false);
  };

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <ModalContext.Provider
      value={{
        showStatusMessage,
        openAlertModal,
        openConfirmModal,
        contact,
        setCustomer,
        customer,
        user,
        setUser,
        guestCart,
        addToGuestCart,
        updateGuestCartItem,
        removeFromGuestCart,
        clearGuestCart,
        accountOwner,
        setAccountOwner,
        fetchUserData,
        isVisible,
        statusMessage,
        messageType,
        startLoading,
        stopLoading,
      }}
    >
      {children}
      {isLoading && <Loading />}
      <CustomAlertModal
        isOpen={isAlertVisible}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
      />
      <CustomConfirmModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmationModalConfirm}
        onCancel={handleConfirmationModalCancel}
        message={modalMessage}
      />
    </ModalContext.Provider>
  );
};
