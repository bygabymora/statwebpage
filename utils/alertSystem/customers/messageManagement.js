export const messageManagement = (
  contact,
  actionName,
  message,
  order,
  item,
  accountOwner
) => {
  let emailMessage = {};

  console.log("Account Owner in messageManagement", accountOwner);

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
        p2: `<div style="font-weight: light; font-size: 20px; color: #333333; ">The message you sent was: ${message}</div>
          <div style="font-weight: light; font-size: 20px; color: #333333; ">We will contact you at ${contact.email} as soon as possible.</div>`,
        p3: `<div style="font-weight: light; font-size: 15px; color: #333333; ">Our team will review your request and get back to you within 24 hours!
               <br>
              <strong> Stat Surgical Supply </strong>       
              </div>`,
      };
      break;
    case "Product Wait List":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name} Thank you for your interest in our product!`,
        p1: `<div style="font-size: 17px; color: #333333;">The product you are interested in is:</div>`,
        p2: `<div style="font-weight: bold; font-size: 18px;">${item.name} by ${item.manufacturer}</div>`,
        p3: `<div style="font-size: 15px; color: #333333;">We will notify you once the product is available.
            <br>
            <strong> Stat Surgical Supply </strong>
            </div>`,
      };
      break;

    case "Product Request":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name} Thank you for your product request!`,
        p1: `<div style="font-weight: light; font-size: 20px; color: #333333;">Your Request is:</div>`,
        p2: `<div style="font-weight: light; font-size: 20px; color: #333333;">Product: ${item.searchedWord} <br> Manufacturer: ${item.manufacturer} <br> Quantity: ${item.quantity}</div>`,
        p3: `<div style="font-weight: light; font-size: 20px; color: #333333;">Additional Message: ${message}
              <br>
             <strong> We will try our best to find it! </strong>
             </div>`,
      };
      break;

    case "Order Confirmation":
      emailMessage = {
        subject: `Order Confirmation – ${contact.name}`,

        // Hero thanks
        p1: `
            <div style="
              font-weight: bold;
              font-size: 30px;
              color: #144e8b;
              margin-bottom: 20px;
            ">
              Thank you for your order!
            </div>
          `,

        // Card with all the important info + conditional notice + items table
        p2: `
            <div style="
              background-color: #ffffff;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: ;
            ">
              ${
                order.paymentMethod === "Stripe" &&
                order.shippingPreferences.paymentMethod === "Bill Me"
                  ? `<div style="
                      background-color: #fff3cd;
                      color: #856404;
                      padding: 12px;
                      border-radius: 4px;
                      margin-bottom: 20px;
                      font-size: 14px;
                    ">
                      You selected the “Bill Me” option for Shipping Payment. You will receive an email when your order is ready to ship, including the shipment cost so you can complete payment, and we can ship it.
                    </div>`
                  : ""
              }
      
              <table width="100%" style="border-collapse: collapse; font-size: 16px; color: #333;">
                <tr>
                  <th align="left" style="padding: 8px 0; font-weight: 600;">Order #</th>
                  <td align="right" style="padding: 8px 0;">${
                    order.docNumber
                  }</td>
                </tr>
                <tr style="border-top: 1px solid #ddd;">
                  <th align="left" style="padding: 8px 0; font-weight: 600;">Total</th>
                  <td align="right" style="padding: 8px 0;">$${
                    order.totalPrice
                  }</td>
                </tr>
                <tr style="border-top: 1px solid #ddd;">
                  <th align="left" style="padding: 8px 0; font-weight: 600;">Payment</th>
                  <td align="right" style="padding: 8px 0;">${
                    order.paymentMethod
                  }</td>
                </tr>
                <tr style="border-top: 1px solid #ddd;">
                  <th align="left" style="padding: 8px 0; font-weight: 600;">Shipping</th>
                  <td align="right" style="padding: 8px 0;">
                    ${order.shippingPreferences.shippingMethod} via ${
          order.shippingPreferences.carrier
        }
                  </td>
                </tr>
                ${
                  order.shippingPreferences.account
                    ? `<tr style="border-top: 1px solid #ddd;">
                         <th align="left" style="padding: 8px 0; font-weight: 600;">Acct #</th>
                         <td align="right" style="padding: 8px 0;">${order.shippingPreferences.account}</td>
                       </tr>`
                    : ""
                }
                <tr style="border-top: 1px solid #ddd;">
                  <th align="left" style="padding: 8px 0; font-weight: 600;">Terms</th>
                  <td align="right" style="padding: 8px 0;">${
                    order.defaultTerm
                  }</td>
                </tr>
              </table>
      
              <!-- Items Ordered Table -->
              <div style="margin-top: 20px;">
                <p style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Items Ordered</p>
                <table width="100%" style="border-collapse: collapse; font-size: 16px; color: #333;">
                  <thead>
                    <tr>
                      <th align="left" style="padding: 6px 0; font-weight: 600;">Qty</th>
                      <th align="left" style="padding: 6px 0; font-weight: 600;">Product</th>
                      <th align="right" style="padding: 6px 0; font-weight: 600;">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.orderItems
                      .map(
                        (item) => `
                      <tr style="border-top: 1px solid #eee;">
                        <td style="padding: 6px 0;">${item.quantity}</td>
                        <td style="padding: 6px 0;">${item.name}</td>
                        <td style="padding: 6px 0; text-align: right;">$${item.totalPrice}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
          `,

        // Footer note
        p3: `
            <div style="
              font-weight: bold;
              font-size: 15px;
              color: #333;
              line-height: 1.4;
            ">
              We're processing your order now and will let you know as soon as it ships.
              If you have any questions, feel free to contact me.
            </div>
          <div style="font-weight: light; font-size: 15px; color: #333333; margin-bottom: 20px; margin-top: 20px;">
          You can see your order status and details in the next link or in your account under <strong>Order History</strong>.
          </div>
           <div style="font-weight: light; font-size: 15px; color: #333333; margin-bottom: 20px; margin-top: 20px;">
            <a href=${
              "https://statsurgicalsupply.com/order/" + order._id
            } target="_blank" 
                    style="display: inline-block; padding: 10px 20px; background-color: #144e8b; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Check It Now
                 </a><br><br>
                 
                 </div>
          `,
      };
      break;
    case "Registration approved":
      emailMessage = {
        ...emailMessage,
        subject: `Your Registration Has Been Approved`,
        p1: `<div style="font-weight: light; font-size: 17px; color: #333333;">
                 Your registration has been approved! You can now access your account, view our available stock, and start purchasing products directly from our platform.
               </div>`,
        p2: `<div style="font-weight: light; font-size: 18px; color: #333333;">
                 <strong>Email:</strong> ${contact.email}
               </div>`,
        p3: `<div style="font-weight: light; font-size: 15px; color: #333333; ">
                 I'm <strong>${accountOwner.name}</strong> and I’ll be the one in charge of any request or support you may need. <br>
                 Please feel free to reach out at any time. <br><br>
                 <a href="https://statsurgicalsupply.com/" target="_blank" 
                    style="display: inline-block; padding: 10px 20px; background-color: #144e8b; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Start Shopping Now
                 </a><br><br>
                 Thank you for choosing us! <br>
                 <strong>Stat Surgical Supply</strong>
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
                 <strong>Product:</strong> ${item.productName} <br>
                 <strong>Manufacturer:</strong> ${item.emailManufacturer}
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
        p1: `<div style="font-weight: light; font-size: 20px; color: #333333;">
                  Thank you for subscribing to our newsletter! We're excited to keep you updated with the latest news, exclusive offers, and valuable insights.
                 </div>`,
        p2: `<div style="font-weight: light; font-size: 18px; color: #333333;">
                   Stay tuned for exciting content straight to your inbox. If you ever have any questions or feedback, feel free to reach out to us!
                 </div>`,
        p3: `<div style="font-weight: light; font-size: 15px; color: #333333;">
                   We appreciate having you as part of our community! <br><br>
                   Best regards, <br><br>
                   <strong> Stat Surgical Supply </strong>
                 </div>`,
      };
      break;
    case "Forgot Password":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name}, Your Password Reset Code`,
        p1: `<div style="font-size: 17px; color: #333333;">
                 We received a request to reset your password.:
               </div>`,
        p3: `
        <div style="font-weight: bold; font-size: 15px; color: #333333;">
         This is your password reset code. You don't need to copy it. It's only for informative purposes. <br>
         </div>
        <div style="font-weight: bold; font-size: 24px; margin: 12px 0; color: #144e8b;">
                 ${message}
               </div>
               <div style="font-size: 15px; color: #333333;">
              
                 This code will expire in 10 minutes. <br>
                 If you did not request a password reset, please ignore this email or contact support.<br><br>
                 Thank you for choosing us! <br>
               <strong>Stat Surgical Supply</strong>
               </div>
               `,
        p2: `<div style="font-weight: light; font-size: 15px; color: #333333; ">
               I'm <strong>${accountOwner.name}</strong> and I'll be the one in charge of any request or support you may need. <br>
               Please feel free to reach out at any time. <br><br>
               <a href="https://statsurgicalsupply.com/authenticateCode?email=${contact.email}&code=${message}" target="_blank" 
                  style="display: inline-block; padding: 10px 20px; background-color: #144e8b; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 Follow the link to reset your password
               </a><br><br>
              
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
