// utils/formatDateWithMonthInLetters.js

const formatDateWithMonthInLetters = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  // e.g. "May 14, 2025" — matches moment.utc().format("MMMM DD, YYYY")
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(d);
};

export default formatDateWithMonthInLetters;
