// Asks the server to send one of the site's emails. The server builds the
// email and picks its recipient (see utils/alertSystem/emailActions.js); the
// browser only names it and passes the form data it needs.
// Resolves to the fetch Response.
export default function requestEmail(action, data = {}) {
  return fetch("/api/emails/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, action }),
  });
}

// What to tell the visitor when a request failed: the server's own message
// when they hit the attempt limit ("try again in N minutes"), else `fallback`.
export async function emailErrorMessage(response, fallback) {
  if (response.status !== 429) return fallback;
  const data = await response.json().catch(() => ({}));
  return data?.message || fallback;
}
