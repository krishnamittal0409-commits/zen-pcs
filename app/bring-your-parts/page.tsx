// app/bring-your-parts/page.tsx
"use client";

import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

const supabase = createClient();

const CATEGORIES = [
  { key: "processor", label: "Processor" },
  { key: "motherboard", label: "Motherboard" },
  { key: "memory", label: "Memory" },
  { key: "graphics_card", label: "Graphics Card" },
  { key: "storage", label: "Storage" },
  { key: "power_supply", label: "Power Supply" },
  { key: "cooling", label: "Cooling" },
  { key: "case", label: "Case" },
] as const;

type DraftPart = {
  id: number;
  category: string;
  rawText: string;
};

const OS_OPTIONS = [
  { key: "linux", label: "Linux", priceLabel: "Free", price: 0 },
  { key: "windows11", label: "Windows 11", priceLabel: "+ ₹299", price: 299 },
  { key: "windows11_pro", label: "Windows 11 Pro", priceLabel: "+ ₹399", price: 399 },
] as const;

const ASSEMBLY_FEE = 5000;

export default function BringYourOwnPartsPage() {
  const { user, signInWithGoogle } = useAuth();

  const [category, setCategory] = useState<string>(CATEGORIES[0].key);
  const [partText, setPartText] = useState("");
  const [parts, setParts] = useState<DraftPart[]>([]);
  const [nextId, setNextId] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [osChoice, setOsChoice] = useState<string>(OS_OPTIONS[0].key);
  const [wantsOs, setWantsOs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const categoriesCovered = new Set(parts.map((p) => p.category)).size;
  const progressPercent = Math.round((categoriesCovered / CATEGORIES.length) * 100);

  const osFee = wantsOs ? OS_OPTIONS.find((o) => o.key === osChoice)?.price ?? 0 : 0;
  const totalFee = ASSEMBLY_FEE + osFee;

  function handleAddPart() {
    const trimmed = partText.trim();

    if (trimmed.length === 0) {
      setError("Type a part name before adding it.");
      return;
    }

    const newPart: DraftPart = { id: nextId, category, rawText: trimmed };

    setParts((prev) => [...prev, newPart]);
    setNextId((prev) => prev + 1);
    setPartText("");
    setError(null);
  }

  function handleRemovePart(id: number) {
    setParts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSubmit() {
    if (parts.length === 0) {
      setError("Add at least one part before submitting.");
      return;
    }

    if (!user) {
      setShowSignInPrompt(true);
      return;
    }

    setSubmitting(true);

    const osSelection = wantsOs ? OS_OPTIONS.find((o) => o.key === osChoice) : null;

    // 1. Create the submission header row
    const { data: submission, error: submissionError } = await supabase
      .from("custom_build_submissions")
      .insert({
        user_id: user.id,
        wants_os: wantsOs,
        os_choice: osSelection ? osSelection.label : null,
        os_fee: osFee,
        assembly_fee: ASSEMBLY_FEE,
        total_fee: totalFee,
      })
      .select()
      .single();

    if (submissionError || !submission) {
      setSubmitting(false);
      alert("Couldn't submit request: " + (submissionError?.message ?? "unknown error"));
      return;
    }

    // 2. Insert every part, linked to that submission
    const partRows = parts.map((p) => ({
      submission_id: submission.id,
      category: p.category,
      raw_text: p.rawText,
    }));

    const { error: partsError } = await supabase
      .from("custom_build_parts")
      .insert(partRows);

    setSubmitting(false);

    if (partsError) {
      alert("Submission created, but couldn't save parts: " + partsError.message);
      return;
    }

    alert("Request submitted! We'll review it and get back to you.");
    setParts([]);
    setWantsOs(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500">
          <span className="text-red-500">•</span> Bring Your Parts
        </div>

        <h1 className="mt-4 text-5xl font-extrabold leading-tight sm:text-6xl">
          Bring Your <span className="text-red-500">Own Parts</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          Already own some parts? List them below and we&apos;ll check
          compatibility, quote a build fee, and let you know how to ship
          them to us.
        </p>

        <div className="mt-10">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-gray-500">
            <span>Parts Added</span>
            <span className="text-red-500">{progressPercent}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
            <div
              className="h-full rounded-full bg-red-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-red-900/60 bg-[#0D0D0D] p-8">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <span className="h-6 w-1 rounded bg-red-600" />
              Add Your Parts
            </h2>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white sm:w-52"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={partText}
                onChange={(e) => setPartText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPart();
                }}
                placeholder="e.g. Ryzen 7 7800X3D"
                className="flex-1 rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white placeholder:text-gray-600"
              />

              <button
                type="button"
                onClick={handleAddPart}
                className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Add Part
              </button>
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            <div className="mt-6 flex flex-col gap-3">
              {parts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nothing added yet — use the fields above to add your first part.
                </p>
              ) : (
                parts.map((part, index) => {
                  const label =
                    CATEGORIES.find((c) => c.key === part.category)?.label ??
                    part.category;

                  return (
                    <div
                      key={part.id}
                      className="flex items-center gap-4 rounded-lg border border-[#1F1F1F] bg-black px-4 py-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#333] text-xs text-gray-400">
                        {index + 1}
                      </span>

                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-widest text-gray-500">
                          {label}
                        </p>
                        <p className="text-sm text-white">{part.rawText}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePart(part.id)}
                        className="text-xs uppercase tracking-widest text-gray-500 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-red-900/60 bg-[#0D0D0D] p-8">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <span className="h-6 w-1 rounded bg-red-600" />
              Your Request
            </h2>

            <div className="mt-6 flex flex-col gap-4">
              {CATEGORIES.map((c) => {
                const match = parts.find((p) => p.category === c.key);
                return (
                  <div key={c.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-400">
                      <span className="h-1 w-1 rounded-full bg-red-600" />
                      {c.label}
                    </span>
                    <span className={match ? "text-white" : "text-gray-600"}>
                      {match ? match.rawText : "Not added"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-[#1F1F1F] pt-6">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Total parts</span>
                <span className="text-white">{parts.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
                <span>Operating system</span>
                <span className="text-white">
                  {wantsOs
                    ? OS_OPTIONS.find((o) => o.key === osChoice)?.label
                    : "Not requested"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
                <span>OS fee</span>
                <span className="text-red-500">₹{osFee}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
                <span>Assembly fee</span>
                <span className="text-red-500">₹{ASSEMBLY_FEE}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#1F1F1F] pt-4 text-base font-semibold">
                <span className="text-white">Total fee</span>
                <span className="text-red-500">₹{totalFee}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-6 w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>

            {!user && (
              <p className="mt-3 text-center text-xs text-gray-500">
                Sign in required to submit
              </p>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-red-900/60 bg-[#0D0D0D] p-8">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={wantsOs}
              onChange={(e) => setWantsOs(e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            <span className="text-lg font-semibold">
              I need an operating system installed
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Leave this unchecked if you already have an OS or will install one
            yourself.
          </p>

          {wantsOs && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {OS_OPTIONS.map((option) => (
                <label
                  key={option.key}
                  className={`flex cursor-pointer flex-col gap-1 rounded-lg border px-4 py-3 ${
                    osChoice === option.key
                      ? "border-red-600 bg-black"
                      : "border-[#262626] bg-black"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="os"
                      checked={osChoice === option.key}
                      onChange={() => setOsChoice(option.key)}
                      className="h-4 w-4 accent-red-600"
                    />
                    <span className="text-sm font-medium text-white">
                      {option.label}
                    </span>
                  </span>
                  <span
                    className={`text-xs ${
                      option.price === 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {option.priceLabel}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>
      </main>

      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h3 className="flex items-center gap-3 text-lg font-bold">
              <span className="h-5 w-1 rounded-full bg-red-600" />
              Sign in to continue
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to submit your parts request.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                className="text-sm font-medium text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  signInWithGoogle();
                  setShowSignInPrompt(false);
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}