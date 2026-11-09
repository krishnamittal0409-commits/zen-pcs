// app/support/page.tsx
"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "../../lib/supabase";
import { Headphones, ShieldCheck, HelpCircle, Mail, Send, CheckCircle2 } from "lucide-react";

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
      "We accept secure online payments via Razorpay (Credit Cards - Visa, MasterCard, RuPay; Debit Cards; and Direct Bank Transfer / Net Banking across 50+ banks) as well as White-Glove Doorstep Delivery, where you can pay our technician directly via Card POS terminal, direct bank transfer, or cash upon delivery and setup.",
  },
  {
    question: "Can I track my order status?",
    answer:
      "Yes you can through your Account Dashboard and live order tracking portal.",
  },
];

const CATEGORIES = [
  { key: "general", label: "General Hardware Inquiry" },
  { key: "order_issue", label: "Order & Build Status" },
  { key: "byop", label: "Bring Your Own Parts (BYOP)" },
  { key: "warranty", label: "Warranty & RMA Claim" },
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
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-black to-black py-16">
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-red-600/10 blur-[130px] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
            <Headphones className="h-4 w-4" />
            <span>Hardware Concierge & Client Support</span>
          </div>

          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
            We&apos;re Here to <span className="text-red-500">Help</span>
          </h1>

          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Explore frequent questions on warranties and assembly, or submit a direct inquiry
            to our senior lab technicians.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8 space-y-8">
        {/* Contact direct card */}
        <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                Direct Lab Channel
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                Reach Engineering Concierge Directly
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Average reply time within 4 hours during testing lab hours (Mon - Sat).
              </p>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-5 py-3 text-xs font-bold text-red-400 hover:border-red-500 hover:text-white transition shadow-sm"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{SUPPORT_EMAIL}</span>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-xl">
          <div className="border-b border-zinc-800/80 pb-4 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
              Knowledge Base
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              Frequently Answered Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className={`rounded-2xl border transition-all ${
                    isOpen
                      ? "border-zinc-700 bg-zinc-900/80"
                      : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-xs sm:text-sm font-semibold text-white"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`text-base font-bold transition-transform ${
                        isOpen ? "text-red-500 rotate-45" : "text-zinc-500"
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-zinc-800/80 px-5 py-3.5 text-xs text-zinc-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Raise a ticket */}
        <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-xl">
          <div className="border-b border-zinc-800/80 pb-4 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
              Ticket Submission
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              Open a Dedicated Service Ticket
            </h2>
          </div>

          {success ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-6 text-xs text-emerald-300">
              <strong className="block text-sm font-bold mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Ticket Submitted Successfully!
              </strong>
              Your service ticket has been routed to our lab queue. A confirmation email and status update
              will be dispatched to your inbox shortly.
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-2.5 text-xs text-white placeholder-zinc-600 shadow-inner outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@battlestation.com"
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-2.5 text-xs text-white placeholder-zinc-600 shadow-inner outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Order Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. ZEN-1042"
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-2.5 text-xs text-white placeholder-zinc-600 shadow-inner outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Inquiry Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-2.5 text-xs text-white shadow-inner outline-none focus:border-red-500"
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Detailed Hardware Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe your inquiry, component questions, or service requirement..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-2.5 text-xs text-white placeholder-zinc-600 shadow-inner outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Attach Screenshot or Invoice (optional, max 1 MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAttachmentChange}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-2 text-xs text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white hover:file:bg-red-700"
                />
                {attachment && !attachmentError && (
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {attachment.name} ({Math.round(attachment.size / 1024)} KB)
                  </p>
                )}
                {attachmentError && (
                  <p className="mt-1 text-xs text-red-500">{attachmentError}</p>
                )}
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50 shadow-md shadow-red-950/40"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? "Transmitting…" : "Transmit Service Ticket"}</span>
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
