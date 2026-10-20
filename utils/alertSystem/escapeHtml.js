const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Text typed by visitors is interpolated into email HTML; escaping it keeps
// it from adding markup (links, images, forms) to emails we send.
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

// Escapes every string inside plain JSON data (objects and arrays), leaving
// numbers, booleans and null as they are.
export const escapeHtmlDeep = (value) => {
  if (typeof value === "string") return escapeHtml(value);
  if (Array.isArray(value)) return value.map(escapeHtmlDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, escapeHtmlDeep(item)]),
    );
  }
  return value;
};
