import htmlFile from "!!raw-loader!./htmlFile.html";

// Replaces {{placeholder}} in the HTML with actual data
const replacePlaceholders = (template, data) => {
  let output = template;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, "g");
    output = output.replace(regex, data[key] || "");
  }
  return output;
};

export const generateEmailHTML = ({ message, contact }) => {
  const data = {
    contactName: contact.name,
    p1: message.p1,
    p2: message.p2,
    p3: message.p3,
  };

  return replacePlaceholders(htmlFile, data);
};
