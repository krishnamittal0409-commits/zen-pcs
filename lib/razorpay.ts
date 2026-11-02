import Razorpay from "razorpay";
import crypto from "crypto";

// Fallback to test credentials if environment variables are not yet configured in deployment
const TEST_KEY_ID = "rzp_test_Tv2S3vyatJ5ixW";
const TEST_KEY_SECRET = "gzu3Nl3iWNDXIsZ1XemLQ6g4";

/**
 * Returns validated, trimmed Razorpay key pair
 */
export function getRazorpayKeys() {
  const envKey = (
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    ""
  )
    .trim()
    .replace(/^["']|["']$/g, "");

  const envSecret = (process.env.RAZORPAY_KEY_SECRET || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  // If either is missing or empty, fall back to tested test credentials pair
  if (!envKey || !envSecret) {
    return {
      key_id: TEST_KEY_ID,
      key_secret: TEST_KEY_SECRET,
    };
  }

  return {
    key_id: envKey,
    key_secret: envSecret,
  };
}

/**
 * Returns a Razorpay instance lazily to prevent build-time crashes
 * when environment variables are missing during static analysis.
 */
export function getRazorpay(): Razorpay {
  const { key_id, key_secret } = getRazorpayKeys();
  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Validates Razorpay payment signature using HMAC SHA-256
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const { key_secret } = getRazorpayKeys();

  const hmac = crypto.createHmac("sha256", key_secret);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest("hex");

  return generatedSignature === signature;
}
