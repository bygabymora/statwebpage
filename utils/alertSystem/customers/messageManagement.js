export const messageManagement = (
  contact,
  actionName,
  message,
  order,
  item,
  accountOwner,
) => {
  let emailMessage = {};

  console.log("Account Owner in messageManagement", accountOwner);

  switch (actionName) {
    case "Register":
      emailMessage = {
        ...emailMessage,
        subject: `${contact.name}, You are now registered on our Web Page.`,
        p1: `
      <div style="font-weight: light; font-size: 17px; color: #333333;">
        Thank you for trusting us and considering our services. 
        We will work to approve your account within 24 hours.
      </div> 
    `,
        p2: `
      <div style="font-weight: light; font-size: 20px; color: #333333;">
        If it takes longer than expected, please contact us for more information. 
        Thank you for choosing us!
      </div>
    `,
        p3: `
      <div style="font-weight: light; font-size: 16px; color: #333333; margin-top: 20px;">
        <strong>Registration Summary:</strong>
        <table style="border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 4px 8px;"><strong>Full Name:</strong></td>
            <td style="padding: 4px 8px;">${contact.name}</td>
          </tr>
          <tr>
            <td style="padding: 4px 8px;"><strong>Email:</strong></td>
            <td style="padding: 4px 8px;">${contact.email}</td>
          </tr>
          <tr>
            <td style="padding: 4px 8px;"><strong>Company Name:</strong></td>
            <td style="padding: 4px 8px;">${contact.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 8px;"><strong>Company EIN:</strong></td>
            <td style="padding: 4px 8px;">${contact.companyEinCode}</td>
          </tr>
        </table>
      </div>
      <div style="font-weight: light; font-size: 15px; color: #333333; margin-top: 25px;">
        If you have any questions, please contact us.<br>
        <strong>Stat Surgical Supply</strong>
      </div>
    `,
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
        subject: `${contact.name} - Thank you for your product request!`,
        p1: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
        Thank you for considering <strong>STAT Surgical Supply</strong> for your needs. We've added the item to your wishlist, and as soon as it becomes available, we’ll notify you right away.
      </div>
    `,
        p2: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
        <strong>Contact Information:</strong><br>
        • Name: ${contact.name}<br>
        • Email: ${contact.email}<br>
        • Phone: ${contact.phone}
      </div>
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
        <strong>Requested Product:</strong><br>
        • Reference: ${item.searchedWord}<br>
        • Manufacturer: ${item.manufacturer}<br>
        • Quantity: ${item.quantity}<br>
        • Unit of Measure: ${contact.uom}
      </div>
    `,
        p3: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
        <strong>Additional Notes:</strong><br>
        ${message ? message : "—"}<br><br>
        We truly appreciate your trust in us and are committed to helping you find exactly what you need.
        <br><br>
        Warm regards,<br>
        <strong>STAT Surgical Supply Team</strong>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://www.statsurgicalsupply.com/support"
           style="background-color: #0e355e; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
          Contact Us
        </a>
      </div>
    `,
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
                (
                  order.paymentMethod === "Stripe" &&
                  order.shippingPreferences.paymentMethod === "Bill Me"
                ) ?
                  `<div style="
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
                  order.shippingPreferences.account ?
                    `<tr style="border-top: 1px solid #ddd;">
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
                    `,
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
                 I'm <strong>${accountOwner?.name || "Stat Surgical Supply"}</strong> and I’ll be the one in charge of any request or support you may need. <br>
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
    case "Unsubscribe":
      emailMessage = {
        ...emailMessage,
        subject: `✅ Unsubscription Confirmed - ${contact.name || contact.companyName || "User"}`,
        p1: `<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                 <div style="
                   width: 50px;
                   height: 50px;
                   background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                   border-radius: 50%;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                   flex-shrink: 0;
                   box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                 ">
                   <span style="color: white; font-size: 24px; font-weight: bold;">✓</span>
                 </div>
                 <div>
                   <div style="font-size: 22px; font-weight: 700; color: #059669; margin-bottom: 5px; letter-spacing: -0.3px;">
                     Unsubscription Successful
                   </div>
                   <div style="font-size: 16px; color: #64748b; font-weight: 500;">
                     You will no longer receive our email communications
                   </div>
                 </div>
               </div>`,
        p2: `<div style="text-align: left;">
                 <div style="font-size: 16px; color: #475569; margin-bottom: 25px; line-height: 1.7;">
                   We're sorry to see you go! Your request has been processed and you've been successfully 
                   removed from our mailing list.
                 </div>
                 
                 <div style="
                   background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%, #fef3c7 100%);
                   border-radius: 10px;
                   padding: 20px;
                   margin: 20px 0;
                   border-left: 4px solid #f59e0b;
                   box-shadow: 0 2px 10px rgba(245, 158, 11, 0.1);
                 ">
                   <div style="font-size: 16px; color: #92400e; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                     <span style="font-size: 18px;">🤔</span>
                     Changed your mind?
                   </div>
                   <div style="font-size: 14px; color: #b45309; line-height: 1.6;">
                     If you've unsubscribed by mistake or would like to update your email preferences, 
                     <a href="mailto:sales@statsurgicalsupply.com" style="
                       color: #d97706;
                       text-decoration: none;
                       font-weight: 600;
                       border-bottom: 2px solid #d97706;
                       padding-bottom: 1px;
                     ">contact our support team</a> - we're here to help!
                   </div>
                 </div>
               </div>`,
        p3: `<div style="
                   background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                   border-radius: 10px;
                   padding: 25px;
                   border: 1px solid #e2e8f0;
                 ">
                 <div style="font-size: 15px; color: #475569; margin-bottom: 20px;">
                   <div style="font-weight: 600; color: #1e293b; margin-bottom: 15px; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                     <span style="font-size: 18px;">📋</span>
                     Unsubscription Details
                   </div>
                   
                   <div style="display: grid; gap: 10px;">
                     <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 6px; border: 1px solid #f1f5f9;">
                       <span style="font-weight: 500; color: #64748b;">Company:</span>
                       <span style="color: #1e293b; font-weight: 600;">${contact.companyName || "Not provided"}</span>
                     </div>
                     <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 6px; border: 1px solid #f1f5f9;">
                       <span style="font-weight: 500; color: #64748b;">Email:</span>
                       <span style="color: #1e293b; font-weight: 600;">${contact.email}</span>
                     </div>
                     <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 6px; border: 1px solid #f1f5f9;">
                       <span style="font-weight: 500; color: #64748b;">Date:</span>
                       <span style="color: #1e293b; font-weight: 600;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                     </div>
                   </div>
                 </div>
                 
                 <div style="
                   margin-top: 20px;
                   padding-top: 20px;
                   border-top: 1px solid #e2e8f0;
                   text-align: center;
                 ">
                   <div style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 8px;">
                     Thank you for your past interest in our services. We wish you all the best!
                   </div>
                   <div style="
                     font-size: 16px;
                     font-weight: 700;
                     color: #144e8b;
                   ">
                     Stat Surgical Supply Team
                   </div>
                 </div>
               </div>`,
      };
      break;
    case "Unsubscribe Notification":
      emailMessage = {
        ...emailMessage,
        subject: `🚨 ADMIN ALERT: Unsubscription Alert - ${contact.companyName || contact.email}`,
        p1: `<div style="
                   background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                   border-radius: 12px;
                   padding: 20px;
                   border-left: 4px solid #ef4444;
                   margin-bottom: 10px;
                   box-shadow: 0 2px 10px rgba(239, 68, 68, 0.1);
                 ">
                 <div style="display: flex; align-items: center; gap: 15px;">
                   <div style="
                     width: 45px;
                     height: 45px;
                     background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                     border-radius: 50%;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     flex-shrink: 0;
                     box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                   ">
                     <span style="color: white; font-size: 20px; font-weight: bold;">⚠</span>
                   </div>
                   <div>
                     <div style="font-size: 20px; font-weight: 700; color: #dc2626; margin-bottom: 5px; letter-spacing: -0.3px;">
                       User Unsubscription Alert
                     </div>
                     <div style="font-size: 14px; color: #991b1b; font-weight: 500;">
                       A customer has opted out of email communications
                     </div>
                   </div>
                 </div>
               </div>`,
        p2: `<div style="
                   background: #f8fafc;
                   border-radius: 12px;
                   padding: 25px;
                   border: 1px solid #e2e8f0;
                 ">
                 <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                   <span style="font-size: 20px;">📊</span>
                   Customer Information
                 </div>
                 
                 <div style="display: grid; gap: 12px;">
                   <div style="
                     display: flex;
                     justify-content: space-between;
                     align-items: center;
                     padding: 12px;
                     background: white;
                     border-radius: 8px;
                     border: 1px solid #f1f5f9;
                     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                   ">
                     <span style="font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px;">
                       <span style="font-size: 16px;">🏢</span>
                       Company
                     </span>
                     <span style="color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${contact.companyName || "Not provided"}</span>
                   </div>
                   
                   <div style="
                     display: flex;
                     justify-content: space-between;
                     align-items: center;
                     padding: 12px;
                     background: white;
                     border-radius: 8px;
                     border: 1px solid #f1f5f9;
                     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                   ">
                     <span style="font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px;">
                       <span style="font-size: 16px;">📧</span>
                       Email
                     </span>
                     <span style="color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${contact.email}</span>
                   </div>
                   
                   <div style="
                     display: flex;
                     justify-content: space-between;
                     align-items: center;
                     padding: 12px;
                     background: white;
                     border-radius: 8px;
                     border: 1px solid #f1f5f9;
                     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                   ">
                     <span style="font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px;">
                       <span style="font-size: 16px;">🆔</span>
                       Customer ID
                     </span>
                     <span style="color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${contact._id || "Not available"}</span>
                   </div>
                   
                   <div style="
                     display: flex;
                     justify-content: space-between;
                     align-items: center;
                     padding: 12px;
                     background: white;
                     border-radius: 8px;
                     border: 1px solid #f1f5f9;
                     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                   ">
                     <span style="font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px;">
                       <span style="font-size: 16px;">📅</span>
                       Date
                     </span>
                     <span style="color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                   </div>
                   
                   <div style="
                     display: flex;
                     justify-content: space-between;
                     align-items: center;
                     padding: 12px;
                     background: white;
                     border-radius: 8px;
                     border: 1px solid #f1f5f9;
                     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                   ">
                     <span style="font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px;">
                       <span style="font-size: 16px;">🕐</span>
                       Time
                     </span>
                     <span style="color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${new Date().toLocaleTimeString("en-US", { hour12: true })}</span>
                   </div>
                 </div>
               </div>`,
        p3: `<div style="
                   background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                   border-radius: 12px;
                   padding: 25px;
                   border-left: 4px solid #3b82f6;
                   box-shadow: 0 2px 10px rgba(59, 130, 246, 0.1);
                 ">
                 <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                   <span style="font-size: 20px;">📋</span>
                   Action Required
                 </div>
                 
                 <div style="font-size: 15px; color: #1e40af; line-height: 1.7; margin-bottom: 20px; font-weight: 500;">
                   Please review this unsubscription and take the following actions:
                 </div>
                 
                 <div style="font-size: 14px; color: #1e40af; line-height: 1.6;">
                   <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                     <span style="color: #3b82f6; font-weight: bold;">•</span>
                     Update relevant contact lists and customer records
                   </div>
                   <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                     <span style="color: #3b82f6; font-weight: bold;">•</span>
                     Remove from active email campaigns
                   </div>
                   <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                     <span style="color: #3b82f6; font-weight: bold;">•</span>
                     Archive customer communication preferences
                   </div>
                   <div style="margin-bottom: 25px; display: flex; align-items: center; gap: 8px;">
                     <span style="color: #3b82f6; font-weight: bold;">•</span>
                     Review for any pending orders or communications
                   </div>
                 </div>
                 
                 <div style="
                   text-align: center;
                   padding-top: 20px;
                   border-top: 1px solid #93c5fd;
                 ">
                   <div style="
                     font-size: 16px;
                     font-weight: 700;
                     color: #144e8b;
                     margin-bottom: 5px;
                   ">
                     Stat Surgical Supply - Admin System
                   </div>
                   <div style="font-size: 12px; color: #60a5fa; font-weight: 500;">
                     Automated notification system
                   </div>
                 </div>
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
