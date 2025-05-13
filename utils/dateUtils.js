import moment from "moment";

const formatDateForInput = (date) => {
  if (!date) return "";
  // If date is a Date object, convert it to an ISO string first.
  const validDate = date instanceof Date ? date.toISOString() : date;
  return moment.utc(validDate).format("YYYY-MM-DD");
};

export default formatDateForInput;
