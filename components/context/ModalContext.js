import React, { createContext, useCallback, useEffect, useState, useContext } from 'react';
import StatusMessage from '../main/StatusMessage';
import CustomAlertModal from '../main/CustomAlertModal';
import { useSession } from 'next-auth/react';

const ModalContext = createContext();
export const useModalContext = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
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
      console.log('Opening modal with message:', message);
      setAlertMessage(message);
      setAlertAction(() => action);
      setIsAlertVisible(true);
      setHasSeenModal(true); // Marks that the modal has already been shown in this session 
    }
  };

  const showStatusMessage = useCallback((type, message) => {
    setStatusMessage(message);
    setMessageType(type);
    setIsVisible(true);
  }, []);

  const handleAlertConfirm = () => {
    console.log('Modal confirmed, executing action:', alertAction);
    setIsAlertVisible(false);
    if (alertAction) alertAction(); // Execute the action associated with the modal 
  };

  return (
    <ModalContext.Provider value={{showStatusMessage, openAlertModal, contact}}> 
        
      {children}
      {isVisible && 
        <StatusMessage
          type={messageType}
          message={statusMessage}
          isVisible={isVisible}
          className="fixed top-0 left-0 w-full z-[9999]"
        />
      }
        <CustomAlertModal 
          isOpen={isAlertVisible}
          message={alertMessage}
          onConfirm={handleAlertConfirm}
          className="fixed top-0 left-0 w-full z-[9999]"
        />
    </ModalContext.Provider>
  )
}

