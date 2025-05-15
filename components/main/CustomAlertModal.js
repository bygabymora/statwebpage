import React from "react";

const CustomAlertModal = ({ isOpen, message, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999] p-5'>
      <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm w-full'>
        <h2 className='text-lg font-semibold mb-4'>{message.title}</h2>
        <p className='mb-4 whitespace-pre-line'>{message.body}</p>
        <p className='mb-4 font-bold whitespace-pre-line'>{message.warning}</p>
        <div className='flex justify-end'>
          <button
            data-ignore-context
            onClick={(e) => {
              e.preventDefault();
              if (onConfirm) onConfirm();
            }}
            className='primary-button py-2 px-4 rounded hover:bg-gray-300'
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlertModal;
