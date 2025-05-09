import React from "react";
import PropTypes from "prop-types";

const StatusMessage = ({ type, message, isVisible }) => {
  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const borderColor =
    type === "success" ? "border-green-400" : "border-red-400";
  const textColor = type === "success" ? "text-green-700" : "text-red-700";

  return (
    <div
      className={`fixed ${bgColor} ${borderColor} ${textColor} px-1 rounded z-50
        left-[0.5rem] top-[80%] h-[2rem] w-auto flex items-center justify-center transform -rotate-90 origin-top-left
        overflow-visible md:top-[12.5rem] md:right-2 md:w-full md:h-[2rem] md:rotate-0 md:text-base`}
      role='alert'
    >
      <span className='block text-center'>{message}</span>
      {console.log("StatusMessage", type, message)}
    </div>
  );
};

StatusMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export default StatusMessage;
