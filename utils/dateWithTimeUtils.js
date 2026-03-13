const formatDateWithTimeForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  // Format as YYYY-MM-DD, HH:mm in UTC (matches moment.utc().format("YYYY-MM-DD, HH:mm"))
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}, ${hours}:${minutes}`;
};

export default formatDateWithTimeForInput;
