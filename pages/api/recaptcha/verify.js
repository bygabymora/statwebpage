export default async function handler(req, res) {
  if (req.method !== "POST") {
    // Keep 405 for unsupported methods
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  // To avoid cache
  res.setHeader("Cache-Control", "no-store");

  try {
    const { token, action } = req.body || {};
    if (!token) {
      // 200 with clear reason: avoid falling into the front catch
      return res.status(200).json({ success: false, reason: "missing_token" });
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      // If the secret is missing in PROD, don't throw 500 at the end user
      console.error("[reCAPTCHA] Missing RECAPTCHA_SECRET_KEY in environment");
      return res
        .status(200)
        .json({ success: false, reason: "server_misconfig" });
    }

    const expectedAction = action || "contact_submit";
    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || "0.5");

    // IP (optional): helps Google rank better
    const ipHeader = req.headers["x-forwarded-for"];
    const remoteip = Array.isArray(ipHeader)
      ? ipHeader[0]
      : (ipHeader || "").split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "";

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (remoteip) params.append("remoteip", remoteip);

    const googleRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    let data = null;
    try {
      data = await googleRes.json();
    } catch (e) {
      console.error("[reCAPTCHA] Failed to parse Google response:", e);
      return res
        .status(200)
        .json({ success: false, reason: "google_parse_error" });
    }

    // data: { success, score, action, hostname, challenge_ts, "error-codes": [] }
    if (!data?.success) {
      console.error("[reCAPTCHA] google_not_success:", data);
      return res.status(200).json({
        success: false,
        reason: "google_not_success",
        errorCodes: data?.["error-codes"] || [],
        hostname: data?.hostname || null,
      });
    }

    // Validate action (defense against reuse of the token for other actions)
    if (data?.action && data.action !== expectedAction) {
      console.warn("[reCAPTCHA] wrong_action:", {
        got: data.action,
        expected: expectedAction,
      });
      return res.status(200).json({
        success: false,
        reason: "wrong_action",
        action: data.action,
      });
    }

    if (typeof data?.score === "number" && data.score < minScore) {
      console.warn("[reCAPTCHA] low_score:", { score: data.score, minScore });
      return res.status(200).json({
        success: false,
        reason: "low_score",
        score: data.score,
      });
    }

    // OK
    return res.status(200).json({
      success: true,
      score: data?.score ?? null,
      action: data?.action ?? null,
      hostname: data?.hostname ?? null,
    });
  } catch (err) {
    console.error("[reCAPTCHA verify] unhandled error:", err);
    return res
      .status(200)
      .json({ success: false, reason: "unhandled_server_error" });
  }
}
