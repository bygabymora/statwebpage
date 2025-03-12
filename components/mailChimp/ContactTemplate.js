import { EmailHeader } from "./EmailHeader";

const ContactTemplate = ({ message }) => {
  const emailBody = `
    ${EmailHeader}
    <div class="container" style="font-family: Arial, sans-serif; color: #144e80; padding: 20px;">
      <div class="message-content" style="margin-bottom: 20px; font-size: 16px;">
        ${message}
      </div>
    </div>
    </body>
    </html>
  `;
  return emailBody;
};

export default ContactTemplate;
