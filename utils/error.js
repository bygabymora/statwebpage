/**
 * Extracts error message from various error object formats
 * @param {Error|Object} error - Error object from API response or general error
 * @returns {string} - Human readable error message
 */
export const getError = (error) => {
  // Handle API response errors (axios format)
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle API response errors (alternative format)
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // Handle direct message property
  if (error?.message) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Fallback for unknown error formats
  return "An unexpected error occurred. Please try again.";
};
