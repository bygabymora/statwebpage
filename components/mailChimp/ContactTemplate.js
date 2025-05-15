import { EmailHeader } from "./EmailHeader";

const ContactTemplate = ({ message, signature }) => {
  const emailBody = `
    ${EmailHeader}
    <div class="container" style="font-family: Arial, sans-serif; color: #144e80; padding: 20px;">
      <div class="message-content" style="margin-bottom: 20px; font-size: 16px;">
        ${message}
      </div>
      <hr />
      <!-- Signature aligned to the left -->
      <div style="margin-top: 20px; font-size: 12px; text-align: left;">
        ${signature}
      </div>
    </div>
    </body>
    </html>
  `;
  return emailBody;
};

export default ContactTemplate;
