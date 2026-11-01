import Razorpay from "razorpay";
import crypto from "crypto";

// Fallback to test credentials if environment variables are not yet configured in deployment
const TEST_KEY_ID = "rzp_test_Tv2S3vyatJ5ixW";
const TEST_KEY_SECRET = "gzu3Nl3iWNDXIsZ1XemLQ6g4";

/**
 * Returns a Razorpay instance lazily to prevent build-time crashes
 * when environment variables are missing during static analysis.
 */
export function getRazorpay(): Razorpay {
  const key_id =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    TEST_KEY_ID;

  const key_secret = process.env.RAZORPAY_KEY_SECRET || TEST_KEY_SECRET;

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
  const secret = process.env.RAZORPAY_KEY_SECRET || TEST_KEY_SECRET;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest("hex");

  return generatedSignature === signature;
}
