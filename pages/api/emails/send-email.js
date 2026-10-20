import { getToken } from "next-auth/jwt";
import {
  EmailRequestError,
  buildActionEmail,
  isEmailAction,
} from "../../../utils/alertSystem/emailActions";
import { sendEmailMessage } from "../../../utils/alertSystem/sendEmailMessage";
import {
  EMAIL_RATE_LIMITS,
  enforceRateLimit,
} from "../../../utils/rateLimit";

// Base64-encoded attachments (e.g. an exemption certificate) run well past
// the default 1mb API route body limit.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const createRequestId = () =>
  `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const logEmailFailure = (requestId, stage, details = {}) => {
  console.error("[EMAIL_SEND_FAILED]", {
    requestId,
    stage,
    ...details,
  });
};

// Sends one of the site's emails. The body names the email (`action`) and
// carries the form data it needs; the server decides who receives it, who
// sends it and what it says (see utils/alertSystem/emailActions.js).
export default async function handler(req, res) {
  const requestId = createRequestId();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const body = req.body || {};
  const { action } = body;
  if (!isEmailAction(action)) {
    return res
      .status(400)
      .json({ success: false, error: "Unknown email type", requestId });
  }

  // Public forms: a limited number of attempts per visitor (IP).
  const rateLimit = EMAIL_RATE_LIMITS[action];
  if (
    rateLimit &&
    !(await enforceRateLimit(req, res, `email:${action}`, rateLimit))
  ) {
    return;
  }

  if (!process.env.MAILCHIMP_TRANSACTIONAL_API_KEY) {
    logEmailFailure(requestId, "configuration", {
      reason: "missing_mailchimp_api_key",
      action,
    });
    return res
      .status(500)
      .json({ success: false, message: "API key is missing.", requestId });
  }

  try {
    const token = await getToken({ req });
    const { contact, message, accountOwner, attachment, bcc } =
      await buildActionEmail(action, { body, token });

    await sendEmailMessage(message, contact, accountOwner, {
      attachment,
      bcc,
    });

    return res.status(200).json({ success: true, requestId });
  } catch (error) {
    if (error instanceof EmailRequestError) {
      return res
        .status(error.status)
        .json({ success: false, error: error.message, requestId });
    }
    logEmailFailure(requestId, "send", {
      action,
      errorMessage: error?.message || "Unknown error",
      providerResponse: error?.response?.data,
    });
    return res
      .status(500)
      .json({ success: false, error: "Error sending email", requestId });
  }
}
