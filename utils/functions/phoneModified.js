// utils/functions/phoneModified.js

export default function formatPhoneNumber(phoneNumber, forDisplayOnly = true) {
  // Return empty values if no phone number is provided
  if (!phoneNumber) {
    return forDisplayOnly
      ? ""
      : { formattedDisplayValue: "", numericValue: "" };
  }

  // Remove any non-numeric characters
  let newValue = phoneNumber?.replace(/\D/g, "");

  // Ensure it starts with '1' for the US country code, but remove it for display
  if (!newValue.startsWith("1")) {
    newValue = `1${newValue}`;
  }

  const numericValue = `+${newValue}`; // Keep full numeric value
  const displayValue = newValue.substring(1); // Remove the '1' for display

  // Format display without '+1'
  let formattedDisplayValue = "";

  if (displayValue.length > 0) {
    formattedDisplayValue += `${displayValue.substring(0, 3)}`;
  }
  if (displayValue.length > 3) {
    formattedDisplayValue += `-${displayValue.substring(3, 6)}`;
  }
  if (displayValue.length > 6) {
    formattedDisplayValue += `-${displayValue.substring(6, 10)}`;
  }

  if (forDisplayOnly) {
    return formattedDisplayValue;
  }

  // Return both formatted display value and full numeric value
  return {
    formattedDisplayValue,
    numericValue,
  };
}
