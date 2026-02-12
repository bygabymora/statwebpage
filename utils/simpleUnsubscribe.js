/**
 * Helper function to generate unsubscribe URLs with access parameter
 */

/**
 * Generate a secure unsubscribe URL with access parameter
 * @param {string} email - Customer email (optional, for prefilling)
 * @param {string} companyName - Company name (optional, for prefilling)
 * @param {string} baseUrl - Base URL of your application
 * @returns {string} - Unsubscribe URL with access parameter
 */
export function generateUnsubscribeUrl(
  email = "",
  companyName = "",
  baseUrl = process.env.NEXTAUTH_URL || "https://www.statsurgicalsupply.com",
) {
  const params = new URLSearchParams();

  // Add access parameter
  params.set("access", "allowed");

  // Add optional prefill parameters
  if (email) {
    params.set("email", email);
  }

  if (companyName) {
    params.set("companyName", companyName);
  }

  return `${baseUrl}/unsubscribe?${params.toString()}`;
}

/**
 * Generate unsubscribe link for a customer object
 * @param {object} customer - Customer object from database
 * @returns {string} - Unsubscribe URL with customer info
 */
export function createUnsubscribeLink(customer) {
  const email = customer.email || customer?.user?.email || "";
  const companyName = customer.companyName || "";

  return generateUnsubscribeUrl(email, companyName);
}

/**
 * Generate HTML email footer with unsubscribe link
 * @param {object} customer - Customer object from database
 * @returns {string} - HTML footer with unsubscribe link
 */
export function getEmailFooterWithUnsubscribe(customer) {
  const unsubscribeUrl = createUnsubscribeLink(customer);

  return `
    <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #ccc; font-size: 12px; color: #666; text-align: center;">
      <p>You are receiving this email because you have an account with Stat Surgical Supply.</p>
      <p>
        If you no longer wish to receive these emails, you can 
        <a href="${unsubscribeUrl}" style="color: #007cba; text-decoration: none;">unsubscribe here</a>.
      </p>
      <p style="margin-top: 15px; color: #999;">
        Stat Surgical Supply<br>
        [Your Address]<br>
        [City, State ZIP]
      </p>
    </div>
  `;
}

// Example usage:
// const customer = { email: "yourEmail@example.com", companyName: "ABC Medical" };
// const unsubscribeUrl = createUnsubscribeLink(customer);
// console.log(unsubscribeUrl);
// Output: https://www.statsurgicalsupply.com/unsubscribe?access=allowed&email=yourEmail%40example.com&companyName=ABC%20Medical
