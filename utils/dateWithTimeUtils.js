import moment from "moment";

const formatDateWithTimeForInput = (date) => {
  if (!date) return "";
  // If date is a Date object, convert it to an ISO string first.
  const validDate = date instanceof Date ? date.toISOString() : date;
  // Format the date in a "pretty" format with day of the week, full month name,
  // ordinal day, year, and time (hours and minutes only)
  return moment.utc(validDate).format("YYYY-MM-DD, HH:mm");
};

export default formatDateWithTimeForInput;
