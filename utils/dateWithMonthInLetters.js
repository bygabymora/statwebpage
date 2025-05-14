// utils/formatDateWithMonthInLetters.js

import moment from "moment";

const formatDateWithMonthInLetters = (date) => {
  if (!date) return "";

  const m = moment.utc(date);
  if (!m.isValid()) return "";

  // e.g. "14 May 2025"
  return m.format("MMMM DD, YYYY");
};

export default formatDateWithMonthInLetters;
