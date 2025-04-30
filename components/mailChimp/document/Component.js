import htmlFile from "!!raw-loader!./htmlFile.html";

// Function to replace placeholders in the template
const replacePlaceholders = (template, data) => {
  let output = template;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, "g");
    output = output.replace(regex, data[key] || ""); // Replace with an empty string if the value is missing
  }

  return output;
};

const DocumentComponent = ({ message, contact }) => {
  // Prepare data to inject into the template
  const data = {
    contactName: contact.name,
    p1: message.p1,
    p2: message.p2,
    p3: message.p3,
  };

  let bodyContent = replacePlaceholders(htmlFile, {
    ...data,
  });

  return bodyContent;
};

export default DocumentComponent;
