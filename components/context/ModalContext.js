import React, { createContext, useCallback, useEffect, useState } from 'react'
import StatusMessage from '../main/StatusMessage';
import { useContext } from 'react';
import CustomAlertModal from '../main/CustomAlertModal';
import { useSession } from 'next-auth/react';
const ModalContext = createContext();
export const useModalContext = () => useContext(ModalContext);
export const ModalProvider = ({children}) => {
  const {data: session} = useSession();
  const [isvisible, setIsVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState(" ");
  const [messageType, setMessageType] = useState("success");
  const [alertMessage, setAlertMessage] = useState({});
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertAction, setAlertAction] = useState(null);
  const [contact, setContact] = useState({});
  
  useEffect(() => {
    if (session) {
      setContact(session.user);
    }
  },[session]);

  const openAlertModal = (message, action) => {
    const hasSeenApprovalMessage = localStorage.getItem('hasSeenApprovalMessage');
    if (!hasSeenApprovalMessage) {
    setAlertMessage(message);
    setAlertAction(()=>action);
    setIsAlertVisible(true);
    }
  };
  const showStatusMessage = useCallback((type, message) => {
    setStatusMessage(message);
    setMessageType(type);
    setIsVisible(true);
   },[]);

   const handleAlertConfirm = () => {
    setIsAlertVisible(false);
    localStorage.setItem('hasSeenApprovalMessage', true);
    if (alertAction) alertAction();
  };

  return (
    <ModalContext.Provider value={{showStatusMessage, openAlertModal, contact}}> 
        
      {children}
        <StatusMessage
          type={messageType}
          message={statusMessage}
          isVisible={isvisible}
        />
        <CustomAlertModal 
          isOpen={isAlertVisible}
          message={alertMessage}
          onConfirm={handleAlertConfirm}
        />
    </ModalContext.Provider>
  )
}

