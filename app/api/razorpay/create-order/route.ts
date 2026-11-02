import { NextResponse } from "next/server";
import { getRazorpay, getRazorpayKeys } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Maximum single transaction limit allowed by Razorpay (RBI limit is ₹5,00,000)
const MAX_RAZORPAY_LIMIT_INR = 500000;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    let user = null;

    // 1. Check user from session cookies
    const {
      data: { user: cookieUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (!authError && cookieUser) {
      user = cookieUser;
    }

    // 2. Fallback: Check user from Authorization Bearer token
    if (!user) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data: tokenAuth } = await supabase.auth.getUser(token);
        if (tokenAuth?.user) {
          user = tokenAuth.user;
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in to complete checkout" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    // Razorpay has a maximum transaction limit of ₹5,00,000 (50,00,000 paise).
    // For test mode on premium high-end builds (e.g. Zen Apex at ₹15L),
    // cap the gateway test charge amount to ₹5,00,000 so the test transaction succeeds.
    const chargeAmountInr = Math.min(amount, MAX_RAZORPAY_LIMIT_INR);
    const amountInPaise = Math.round(chargeAmountInr * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${user.id.slice(0, 8)}`,
      notes: {
        userId: user.id,
        actualTotal: String(amount),
        environment: "test",
      },
    };

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);
    const { key_id } = getRazorpayKeys();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      actualAmount: amount,
      isCappedForTest: amount > MAX_RAZORPAY_LIMIT_INR,
      keyId: key_id,
    });
  } catch (err: unknown) {
    let message = "Failed to create Razorpay order";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "object" && err !== null) {
      const rzpErr = err as {
        error?: { description?: string; message?: string };
        message?: string;
        description?: string;
      };
      message =
        rzpErr.error?.description ||
        rzpErr.error?.message ||
        rzpErr.description ||
        rzpErr.message ||
        JSON.stringify(err);
    }
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
