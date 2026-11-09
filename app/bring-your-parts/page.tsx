// app/bring-your-parts/page.tsx
"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Wrench, Plus, Trash2, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

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
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

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

    const { data: submission, error: submissionError } = await supabase
      .from("custom_build_submissions")
      .insert({
        user_id: user.id,
        wants_os: wantsOs,
        os_choice: osSelection ? osSelection.label : null,
        os_fee: osFee,
        assembly_fee: ASSEMBLY_FEE,
        total_fee: totalFee,
        status: "pending",
      })
      .select()
      .single();

    if (submissionError) {
      setSubmitting(false);
      setError(`Couldn't submit build request: ${submissionError.message}`);
      return;
    }

    const rows = parts.map((part) => ({
      submission_id: submission.id,
      category: part.category,
      raw_text: part.rawText,
    }));

    const { error: partsError } = await supabase
      .from("custom_build_parts")
      .insert(rows);

    setSubmitting(false);

    if (partsError) {
      setError(`Couldn't save parts: ${partsError.message}`);
      return;
    }

    setParts([]);
    setSubmittedSuccess(true);
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-black to-black py-16">
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-red-600/10 blur-[130px] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
            <Wrench className="h-4 w-4" />
            <span>BYOP White-Glove Atelier Service</span>
          </div>

          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
            Bring Your <span className="text-red-500">Own Parts</span>
          </h1>

          <p className="mt-2 text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Already own a GPU, CPU, or rare cabinet? Ship your hardware to our cleanroom lab.
            We verify compatibility, assemble with custom comb wiring, conduct 48h thermal stress
            validation, and safely deliver it back to your doorstep.
          </p>

          {/* Progress Bar */}
          <div className="mt-8 max-w-md">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Categories Listed</span>
              <span className="text-red-500">{progressPercent}% ({categoriesCovered}/8)</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        {submittedSuccess ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-zinc-950 p-12 text-center shadow-xl">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
            <h2 className="text-2xl font-black text-white">Parts Submission Received!</h2>
            <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Our lead lab engineer is reviewing your hardware list for clearance and power delivery.
              Shipping instructions and a pre-paid insured transit label will be sent to your email.
            </p>
            <button
              type="button"
              onClick={() => setSubmittedSuccess(false)}
              className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Submit Another Build
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            {/* Left Column: Add Parts Form & Parts List */}
            <div className="space-y-6">
              {/* Add Part Section */}
              <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-xl">
                <div className="border-b border-zinc-800/80 pb-4 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                    Step 1
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    Register Your Components
                  </h2>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-xl border border-zinc-800 bg-black/80 px-4 py-2.5 text-xs font-semibold text-white sm:w-48 shadow-inner outline-none focus:border-red-500"
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
                    placeholder="e.g. AMD Ryzen 7 7800X3D or RTX 4080 Super"
                    className="flex-1 rounded-xl border border-zinc-800 bg-black/80 px-4 py-2.5 text-xs text-white placeholder-zinc-600 shadow-inner outline-none focus:border-red-500"
                  />

                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 shadow-md shadow-red-950/40"
                  >
                    <Plus className="h-4 w-4" /> Add Part
                  </button>
                </div>

                {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

                {/* Added Parts List */}
                <div className="mt-6 space-y-2.5">
                  {parts.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">
                      No parts added yet. Select a category above and enter your hardware model.
                    </div>
                  ) : (
                    parts.map((part, index) => {
                      const label =
                        CATEGORIES.find((c) => c.key === part.category)?.label ??
                        part.category;

                      return (
                        <div
                          key={part.id}
                          className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-xs transition hover:border-zinc-700"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-zinc-800 bg-black text-[10px] font-bold text-zinc-400">
                              0{index + 1}
                            </span>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block">
                                {label}
                              </span>
                              <strong className="text-white text-xs">{part.rawText}</strong>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemovePart(part.id)}
                            className="text-zinc-500 hover:text-red-400 p-1.5 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* OS Selection Section */}
              <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsOs}
                    onChange={(e) => setWantsOs(e.target.checked)}
                    className="h-4 w-4 accent-red-600 rounded"
                  />
                  <span className="text-sm font-bold text-white">
                    Pre-install Operating System & Driver Suites
                  </span>
                </label>
                <p className="mt-1 text-xs text-zinc-400 pl-7">
                  Leave unchecked if you prefer bare-metal delivery or wish to install your own OS.
                </p>

                {wantsOs && (
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 pl-7">
                    {OS_OPTIONS.map((option) => (
                      <label
                        key={option.key}
                        className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 transition ${
                          osChoice === option.key
                            ? "border-red-600 bg-red-950/20 shadow-md shadow-red-950/40"
                            : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="os"
                            checked={osChoice === option.key}
                            onChange={() => setOsChoice(option.key)}
                            className="h-3.5 w-3.5 accent-red-600"
                          />
                          <span className="text-xs font-bold text-white">
                            {option.label}
                          </span>
                        </span>
                        <span
                          className={`text-[11px] font-semibold pl-5.5 ${
                            option.price === 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {option.priceLabel}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Build Checklist & Assembly Quote */}
            <div className="space-y-6">
              <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 shadow-xl sticky top-24">
                <div className="border-b border-zinc-800/80 pb-4 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                    Quote Summary
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Cleanroom Labor & Testing
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  {CATEGORIES.map((c) => {
                    const match = parts.find((p) => p.category === c.key);
                    return (
                      <div key={c.key} className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              match ? "bg-emerald-400" : "bg-zinc-700"
                            }`}
                          />
                          {c.label}
                        </span>
                        <span className={`text-[11px] truncate max-w-[130px] font-medium ${match ? "text-white" : "text-zinc-600"}`}>
                          {match ? match.rawText : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-zinc-800/80 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Assembly & Testing Fee:</span>
                    <span className="font-bold text-white">₹{ASSEMBLY_FEE.toLocaleString("en-IN")}</span>
                  </div>
                  {wantsOs && (
                    <div className="flex justify-between text-zinc-400">
                      <span>OS Provisioning:</span>
                      <span className="font-bold text-white">₹{osFee.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline border-t border-zinc-800/80 pt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Total Labor Fee:
                    </span>
                    <span className="text-xl font-black text-red-500">
                      ₹{totalFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-6 w-full rounded-xl bg-red-600 py-3 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50 shadow-md shadow-red-950/40"
                >
                  {submitting ? "Submitting Request…" : "Transmit Build Request"}
                </button>

                {!user && (
                  <p className="mt-3 text-center text-[10px] text-zinc-500">
                    Sign-in required to reserve lab bench space
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Includes 1-Year Comprehensive Assembly Warranty</span>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Sign-in Modal */}
      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Sign In to Reserve Lab Bench
            </h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              An account is required so we can link your incoming shipments, track diagnostics,
              and share live progress.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  signInWithGoogle();
                  setShowSignInPrompt(false);
                }}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-950/40"
              >
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
