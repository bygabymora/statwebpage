import React from "react";

const CustomConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-5">
      {!message.warning3 ? (
        <div
          className={`${
            message.warning2 ? "bg-red-50" : "bg-white"
          } p-6 rounded-lg shadow-lg max-w-sm w-full`}
        >
          <h2 className="text-lg font-semibold mb-4">{message.title}</h2>
          <p className="mb-4">{message.body}</p>
          <div className="mb-4 font-bold">
            <p className={`${message.warning2 ? "text-black" : ""} mb-4`}>
              {message.warning ? message.warning : ""}
            </p>
            {message.warning2 ? (
              <p className="text-red-500 mt-2">{message.warning2}</p>
            ) : (
              ""
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              data-ignore-context
              onClick={(e) => {
                e.preventDefault(), onCancel();
              }}
              className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              data-ignore-context
              onClick={(e) => {
                e.preventDefault(), onConfirm();
              }}
              className={` ${
                message.warning2 ? "bg-red-800 text-white" : "primary-button"
              }  py-2 px-4 rounded hover:bg-gray-300`}
            >
              OK
            </button>
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-5"
          onClick={(e) => e.stopPropagation()} // Prevent event bubbling for modal background
        >
          <div
            className="bg-red-50 p-6 rounded-lg shadow-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()} // Prevent event bubbling for modal content
          >
            <h2 className="text-xl font-semibold mb-4">WARNING ⚠️⚠️⚠️</h2>
            <p className="mb-4 text-lg text-black">
              Do you want to leave the page{" "}
              <span className="strong">without saving?</span>{" "}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                data-ignore-context
                onClick={(e) => {
                  e.preventDefault(), onCancel();
                }}
                className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-300"
              >
                No, Go Back
              </button>
              <button
                data-ignore-context
                onClick={(e) => {
                  e.preventDefault(), onConfirm();
                }}
                className={` ${
                  message.warning2 ? "bg-red-800 text-white" : "primary-button"
                }  py-2 px-4 rounded hover:bg-gray-300`}
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomConfirmModal;
