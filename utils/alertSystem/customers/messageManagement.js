
export const messageManagement = (contact, actionName, message) => {

  let emailMessage = {
  };

  switch (actionName) {
    case "Register":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name}, You are now registered on our Web Page.`,
        p1: `<div style="font-weight: light; font-size: 20px; color: #333333; ">Thank you for trusting us and considering our services. We will work to approve your account within 24 hours.</div> `,
        p2: `<div style="font-weight: light; font-size: 20px; color: #333333; ">If it takes longer than expected, please contact us for more information. Thank you for choosing us!</div>`,
      };
      break;

      case "Contact Us":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name}, You are now registered on our Web Page.`,
        p1: `<div style="font-weight: light; font-size: 20px; color: #333333; ">Thank you for trusting us and considering our services. We will work to approve your account within 24 hours.</div> `,
        p2: `<div style="font-weight: light; font-size: 20px; color: #333333; ">${message}</div>`,
      };
      break;

    default:
      emailMessage = {
        ...emailMessage,
      };
  }

  return emailMessage;
};
