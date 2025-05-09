import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import StatusMessage from "../main/StatusMessage";
import CustomAlertModal from "../main/CustomAlertModal";
import { useSession } from "next-auth/react";

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
  const [contact, setContact] = useState({});
  const [hasSeenModal, setHasSeenModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setContact(session.user);
      setHasSeenModal(false); // Reset the state of the modal when the session changes
    }
  }, [session]);

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

  const showStatusMessage = useCallback((type, message) => {
    setStatusMessage(message);
    setMessageType(type);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
      setStatusMessage("");
    }, 5000);
  }, []);

  return (
    <ModalContext.Provider
      value={{ showStatusMessage, openAlertModal, contact }}
    >
      {children}

      <StatusMessage
        type={messageType}
        message={statusMessage}
        isVisible={isVisible}
      />

      <CustomAlertModal
        isOpen={isAlertVisible}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
      />
    </ModalContext.Provider>
  );
};
