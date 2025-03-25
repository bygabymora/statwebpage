
export const messageManagement = (contact, actionName, message) => {

  let emailMessage = {
  };

  switch (actionName) {
    case "Register":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name}, You are now registered on our Web Page.`,
        p1: `<div style="font-weight: light; font-size: 17px; color: #333333; ">Thank you for trusting us and considering our services. We will work to approve your account within 24 hours.</div> `,
        p2: `<div style="font-weight: light; font-size: 20px; color: #333333; ">If it takes longer than expected, please contact us for more information. Thank you for choosing us!</div>`,
        p3: `<div style="font-weight: light; font-size: 15px; color: #333333; ">If you have any questions, please contact us.
              <br>
            <strong> Stat Surgical Supply </strong>
        </div>`,
      };
      break;

      case "Contact Us":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name}, Thank You for Contacting Us!`,
        p1: `<div style="font-weight: light; font-size: 17px; color: #333333; ">We have received your message and appreciate you reaching out to us.</div>`,
        p2: `<div style="font-weight: light; font-size: 20px; color: #333333; ">The message you sent us: ${message}</div>`,
        p3: `<div style="font-weight: light; font-size: 15px; color: #333333; ">Our team will review your request and get back to you within 24 hours!
             <br>
            <strong> Stat Surgical Supply </strong>       
            </div>`,  
      };
      break;

      case "Product Wait List":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name} is inquiring about a product`,
        p1: `<div style="font-size: 17px; color: #333333;">Customer ${contact.name} is interested in the product:</div>`,
        p2: `<div style="font-weight: bold; font-size: 18px;">${contact.emailName} by ${contact.emailManufacturer}</div>`,
        p3: `<div style="font-size: 15px; color: #333333;">We will notify you once the product is available.
            <br>
            <strong> Stat Surgical Supply </strong>
            </div>`,
      };
      break;

      case "Product Request":
      emailMessage = {
        ...emailMessage,
        subject: `Product Request from ${contact.name}`,
        p1: `<div style="font-weight: light; font-size: 20px; color: #333333;">A customer has requested a product:</div>`,
        p2: `<div style="font-weight: light; font-size: 20px; color: #333333;">Product: ${contact.searchedWord} <br> Manufacturer: ${contact.manufacturer} <br> Quantity: ${contact.quantity}</div>`,
        p3: `<div style="font-weight: light; font-size: 20px; color: #333333;">Additional Message: ${message}
              <br>
             <strong> Stat Surgical Supply </strong>
             </div>`,
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
                 <strong>Shipping Preference:</strong> ${contact.shippingPreference || 'N/A'}
               </div>`,
          p3: `<div style="font-weight: light; font-size: 20px; color: #333333;">
                 We are processing your order and will update you once it ships.
                  <br>
                 <strong> Stat Surgical Supply </strong>
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
                <br>
                <strong> Stat Surgical Supply </strong>
              </div>`,
        };
      break;

      case "Product Manufacturer":
        emailMessage = {
          ...emailMessage,
          subject: `Your Product Request Has Been Received`,
          p1: `<div style="font-weight: light; font-size: 17px; color: #333333;">
                 Thank you for your request! We have received your product inquiry and are processing it.
               </div>`,
          p2: `<div style="font-weight: light; font-size: 18px; color: #333333;">
                 <strong>Product:</strong> ${contact.productName} <br>
                 <strong>Manufacturer:</strong> ${contact.emailManufacturer}
               </div>`,
          p3: `<div style="font-weight: light; font-size: 15px; color: #333333;">
                 Our team will review your request and get back to you shortly. If you have any questions, feel free to contact us.<br><br>
                 Thank you for choosing us! <br>
                 <strong> Stat Surgical Supply </strong>
               </div>`,
        };
        break;

        case "Newsletter Subscription":
          emailMessage = {
            ...emailMessage,
            subject: `Welcome to Our Newsletter! - ${contact.name}`,
            p1: `<div style="font-weight: light; font-size: 17px; color: #333333;">
                   ${contact.name}, Thank you for subscribing to our newsletter! We're excited to keep you updated with the latest news, exclusive offers, and valuable insights.
                 </div>`,
            p2: `<div style="font-weight: light; font-size: 18px; color: #333333;">
                   Stay tuned for exciting content straight to your inbox. If you ever have any questions or feedback, feel free to reach out to us!
                 </div>`,
            p3: `<div style="font-weight: light; font-size: 15px; color: #333333;">
                   We appreciate having you as part of our community! <br><br>
                   Best regards, <br>
                   <strong> Stat Surgical Supply </strong>
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
