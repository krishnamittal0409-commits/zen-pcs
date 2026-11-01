// app/support/page.tsx
//
// Support page — three parts:
// 1. Contact info card (your support email)
// 2. FAQ list (expand/collapse)
// 3. "Raise a Ticket" form — saves to a Supabase table called
//    `support_tickets`, with an optional image attachment (max 1 MB).
//
// ----- Supabase table you need (or already have) -----
// Table name: support_tickets
// Columns:
//   id               → int8, primary key, auto-increment
//   name             → text
//   email            → text
//   order_id         → text (nullable)
//   category         → text
//   message          → text
//   status           → text, default "open"
//   attachment_url   → text, nullable   ← NEW, add this column for images
//   created_at       → timestamptz, default now()
//
// ----- Supabase Storage bucket you need to create -----
// 1. Supabase → Storage → "New bucket"
// 2. Name it exactly: support-attachments
// 3. Toggle it to "Public bucket" (so the image URL we save is viewable
//    without extra auth — fine for support screenshots)
// 4. Save
//
// Once both exist, attaching an image and submitting will upload the file
// to that bucket and store its public URL in the attachment_url column.

"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "../../lib/supabase";


const SUPPORT_EMAIL = "krishnamittal0409@gmail.com";

// Max attachment size in bytes: 1 MB
const MAX_ATTACHMENT_BYTES = 1 * 1024 * 1024;

const FAQS = [
  {
    question: "What's your warranty policy?",
    answer:
      "All builds — whether from Ready PCs, the Custom Builder, or Bring Your Parts — come with a 1-year general warranty covering manufacturing defects.",
  },
  {
    question: "How long does a custom build take?",
    answer:
      "Most custom builds are assembled and shipped within a few business days of your order being confirmed. Bring Your Parts builds may take a little longer since we wait for your parts to arrive first.",
  },
  {
    question: "Do you accept Bring Your Own Parts (BYOP) builds?",
    answer:
      "Yes — use the \"Bring Your Parts\" page to list what you already own. We'll check compatibility, quote a build fee, and give you shipping instructions.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept secure online payments via Razorpay (UPI, Credit/Debit cards, Net Banking) as well as Cash on Delivery (COD), where you can pay our technician directly via Cash or online (UPI) during delivery and setup.",
  },
  {
    question: "Can I track my order status?",
    answer:
      "Yes you can through your Account Dashboard.",
  },
];

const CATEGORIES = [
  { key: "general", label: "General Question" },
  { key: "order_issue", label: "Order Issue" },
  { key: "byop", label: "Bring Your Parts" },
  { key: "warranty", label: "Warranty Claim" },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAttachmentError(null);

    if (!file) {
      setAttachment(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAttachmentError("Please attach an image file.");
      e.target.value = "";
      setAttachment(null);
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError("Image is too large — max size is 1 MB.");
      e.target.value = "";
      setAttachment(null);
      return;
    }

    setAttachment(file);
  }

  async function handleSubmit() {
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);

    // If an image was attached, upload it to Supabase Storage first and
    // get back a public URL to save alongside the ticket.
    let attachmentUrl: string | null = null;

    if (attachment) {
      const fileExt = attachment.name.split(".").pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("support-attachments")
        .upload(filePath, attachment);

      if (uploadError) {
        setSubmitting(false);
        setError(`Couldn't upload image: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("support-attachments")
        .getPublicUrl(filePath);

      attachmentUrl = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("support_tickets").insert({
      name: name.trim(),
      email: email.trim(),
      order_id: orderId.trim() || null,
      category,
      message: message.trim(),
      status: "open",
      attachment_url: attachmentUrl,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setName("");
    setEmail("");
    setOrderId("");
    setCategory(CATEGORIES[0].key);
    setMessage("");
    setAttachment(null);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* ---------- Hero ---------- */}
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500">
          <span className="text-red-500">•</span> Support
        </div>

        <h1 className="mt-4 text-5xl font-extrabold leading-tight sm:text-6xl">
          We&apos;re Here to <span className="text-red-500">Help</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          Check the FAQ below, or raise a ticket and we&apos;ll get back to
          you directly.
        </p>

        {/* ---------- Contact info card ---------- */}
        <section className="mt-10 rounded-2xl border border-red-900/60 bg-[#0D0D0D] p-8">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <span className="h-6 w-1 rounded bg-red-600" />
            Contact Us Directly
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            Prefer email? Reach us anytime at:
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-1 inline-block text-lg font-semibold text-red-500 hover:text-red-400"
          >
            {SUPPORT_EMAIL}
          </a>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="mt-6 rounded-2xl border border-red-900/60 bg-[#0D0D0D] p-8">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <span className="h-6 w-1 rounded bg-red-600" />
            Frequently Asked Questions
          </h2>

          <div className="mt-6 flex flex-col gap-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="rounded-lg border border-[#262626] bg-black"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-white"
                  >
                    {faq.question}
                    <span className="text-red-500">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <p className="border-t border-[#1F1F1F] px-4 py-3 text-sm text-gray-400">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- Raise a ticket ---------- */}
        <section className="mt-6 rounded-2xl border border-red-900/60 bg-[#0D0D0D] p-8">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <span className="h-6 w-1 rounded bg-red-600" />
            Raise a Ticket
          </h2>

          {success ? (
            <div className="mt-6 rounded-lg border border-green-800 bg-green-950/30 px-4 py-4 text-sm text-green-400">
              Ticket submitted! We&apos;ll get back to you at the email you
              provided.
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Order ID (optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. ZEN-1042"
                    className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white placeholder:text-gray-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Attach Image (optional, max 1 MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAttachmentChange}
                  className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-red-700"
                />
                {attachment && !attachmentError && (
                  <p className="mt-1 text-xs text-gray-500">
                    {attachment.name} ({Math.round(attachment.size / 1024)} KB)
                  </p>
                )}
                {attachmentError && (
                  <p className="mt-1 text-xs text-red-500">{attachmentError}</p>
                )}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="self-start rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Ticket"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}