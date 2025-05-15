const SignatureTemplate = ({ userInfo }) => {
  console.log("userInfo", userInfo);
  const {
    name = "",
    charge = "",
    phone = "",
    email = "admin@statsurgicalsupply.com",
    website = "https://www.statsurgicalsupply.com",
    socialLinks = {
      linkedin: "https://www.linkedin.com/company/statsurgicalsupply",
      facebook: "https://www.facebook.com/statsurgicalsupply",
      website: "https://www.statsurgicalsupply.com",
    },
  } = userInfo;

  // Your domain
  const baseUrl = "https://statapp.vercel.app";

  const formatPhoneNumber = (phone) => {
    // Remove the first "1"
    const modifiedPhone = phone.startsWith("1") ? phone.slice(1) : phone;

    // Extract the segments and format them
    const areaCode = modifiedPhone.slice(0, 3);
    const middlePart = modifiedPhone.slice(3, 6);
    const lastPart = modifiedPhone.slice(6);

    // Combine them with hyphens
    const formattedPhone = `${areaCode}-${middlePart}-${lastPart}`;

    return formattedPhone;
  };

  const finalPhone = formatPhoneNumber(phone);

  return `
    <table class="signature-container" style="font-family: Arial, sans-serif; color: #144e80; width: 100%; max-width: 600px;">
      <tr>
        <!-- Logo and Social Icons Column -->
        <td style="width: 100px; vertical-align: top; text-align: center;">
          <img src="${baseUrl}/images/assets/logo.png" alt="Stat Surgical Supply Logo" class="signature-logo" style="width: 100px; height: auto; max-width: 100px; display: block; margin: 0 auto;">
          <!-- Social Icons -->
          <div style="margin-top: 5px;">
            <a href="${socialLinks.linkedin}" style="display: inline-block;">
              <img src="${baseUrl}/images/assets/linkedIn.png" alt="LinkedIn" class="social-icon" style="width: 25px; height: 25px;">
            </a>
            <a href="${socialLinks.facebook}" style="display: inline-block;">
              <img src="${baseUrl}/images/assets/facebook.png" alt="Facebook" class="social-icon" style="width: 25px; height: 25px;">
            </a>
            <a href="${socialLinks.website}" style="display: inline-block;">
              <img src="${baseUrl}/images/assets/website.png" alt="Website" class="social-icon" style="width: 25px; height: 25px;">
            </a>
          </div>
        </td>
        <!-- Contact Info Column -->
        <td style="vertical-align: top; padding-left: 10px; width: 100%;">
          <div class="contact-info" style="font-size: 14px; line-height: 1.6; color: #144e80;">
            <p style="font-size: 16px; font-weight: bold; margin: 0;">${name}</p>
            <p style="margin: 0;">${charge} | <strong>Stat Surgical Supply</strong></p>
            <p style="margin: 0;"><strong> O: </strong><a href="tel:${phone}" style="color: #144e80; text-decoration: none;">${finalPhone}</a></p>
            <p style="margin: 0;"><strong>E: </strong><a href="mailto:${email}" style="color: #144e80; text-decoration: none;">${email}</a></p>
            <p style="margin: 0;"><a href="${website}" target="_blank" style="color: #144e80; text-decoration: none; font-weight: bold;">${website}</a></p>
          </div>
        </td>
      </tr>
    </table>
  `;
};

export default SignatureTemplate;
