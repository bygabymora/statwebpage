import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import CustomAlertModal from "../main/CustomAlertModal";
import { useSession } from "next-auth/react";
import axios from "axios";
import CustomConfirmModal from "../main/CustomConfirmModal";
import Loading from "../main/Loading";

const ModalContext = createContext();
export const useModalContext = () => useContext(ModalContext);

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

  const [isLoading, setIsLoading] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [customer, setCustomer] = useState({});

  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        setContact(session.user);
        const { userData, customerData } = await fetchUserData();
        setUser(userData);
        setCustomer(customerData);
        setHasSeenModal(false); // Reset the state of the modal when the session changes
      }
    };
    loadUserData();
  }, [session]);

  const fetchUserData = async () => {
    const response = await axios.get(`/api/users/${session?.user?._id}`);
    const userData = response.data.user;
    const customerData = response.data.customer;
    return { userData, customerData };
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
