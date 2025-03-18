
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

      case "Product Wait List":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name} is inquiring about a product`,
        p1: `<div style="font-size: 20px; color: #333333;">Customer ${contact.name} is interested in the product:</div>`,
        p2: `<div style="font-weight: bold; font-size: 18px;">${contact.emailName} by ${contact.emailManufacturer}</div>`,
      };
      break;

      case "Product Request":
      emailMessage = {
        ...emailMessage,
        subject: `Product Request from ${contact.name}`,
        p1: `<div style="font-weight: light; font-size: 20px; color: #333333;">A customer has requested a product:</div>`,
        p2: `<div style="font-weight: light; font-size: 20px; color: #333333;">Product: ${contact.searchedWord} <br> Manufacturer: ${contact.manufacturer} <br> Quantity: ${contact.quantity}</div>`,
        p3: `<div style="font-weight: light; font-size: 20px; color: #333333;">Additional Message: ${message}</div>`,
      };
      break;

      case "Order Confirmation":
        emailMessage = {
          subject: `Order Confirmation - ${contact.name}`,
          p1: `<div style="font-weight: light; font-size: 20px; color: #333333;">
                 Thank you for your order, ${contact.name}!
               </div>`,
          p2: `<div style="font-weight: light; font-size: 20px; color: #333333;">
                 <strong>Order Total:</strong> ${contact.total} <br>
                 <strong>Payment Method:</strong> ${contact.paymentMethod} <br>
                 <strong>Shipping Preference:</strong> ${contact.shippingPreference}
               </div>`,
          p3: `<div style="font-weight: light; font-size: 20px; color: #333333;">
                 We are processing your order and will update you once it ships.
               </div>`,
        };
        break;

      case "Order Shipped":
        emailMessage = {
        subject: `Order Confirmation for - ${contact.name}`,
        p1: `<div style="font-size: 20px; color: #333333;">
              Thank you for your order, ${contact.name}! Your order details are as follows:
             </div>`,
        p2: `<div style="font-size: 18px; color: #333333;">
               <strong>Total:</strong> $${contact.total} <br>
               <strong>Payment Method:</strong> ${contact.paymentMethod} <br>
               <strong>Shipping Notes:</strong> ${contact.shippingPreference || 'N/A'}
             </div>`,
        p3: `<div style="font-size: 18px; color: #333333;">
               <strong>Items Ordered:</strong>
               <ul>
                   ${contact.items.map(item => 
                   `<li>${item.quantity}x ${item.name} - $${item.price}</li>`).join('')}
                </ul>
              </div>`,
        };
      break;

    default:
      emailMessage = {
        ...emailMessage,
      };
  }

  return emailMessage;
};
