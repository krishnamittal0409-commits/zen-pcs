// app/fps-calculator/page.tsx
//
// FPS Calculator — now pulling REAL Processor and Graphics Card rows from
// your Supabase `components` table, instead of a hardcoded list.
//
// HOW SCORING WORKS NOW:
// Your `components` table doesn't have a performance-score column yet, so
// this page does two things:
//   1. If a row has a `benchmark_score` value (0–100), it uses that.
//   2. If not, it tries to recognize the model name (e.g. "RTX 5080",
//      "Ryzen 7 7800X3D") from a small built-in list of known models and
//      guesses a reasonable score. If it doesn't recognize the name either,
//      it falls back to a neutral default score of 50 and shows a small
//      "estimated" note next to that part in the dropdown.
//
// TO GET MORE ACCURATE RESULTS:
// Add a column called `benchmark_score` (type int8, values roughly 0–100)
// to your `components` table in Supabase, and fill it in for your CPUs and
// GPUs. Once a row has a value there, this page will automatically use it
// instead of guessing.
//
// NOTE ON THE SUPABASE IMPORT BELOW:
// This assumes your client file is at `supabase.ts` in your project root,
// exporting `supabase`. If your actual file lives somewhere else (e.g.
// inside `lib/`), just update the import path on the next line.

"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

// A row from your `components` table, only the fields this page needs.
type Component = {
  id: number;
  name: string;
  category: string;
  price: number;
  benchmark_score: number | null; // will be null until you add real data
};

// ---------- Fallback scoring for known model names ----------
// Used ONLY when a component's `benchmark_score` column is empty.
// Rough relative performance, 0–100. Add more patterns any time you notice
// a part guessing incorrectly.
const KNOWN_MODEL_SCORES: { pattern: string; score: number }[] = [
  // CPUs
  { pattern: "9950x3d", score: 99 },
  { pattern: "9800x3d", score: 94 },
  { pattern: "7950x3d", score: 90 },
  { pattern: "7800x3d", score: 85 },
  { pattern: "13900k", score: 97 },
  { pattern: "13700k", score: 87 },
  { pattern: "7600", score: 70 },
  { pattern: "5600", score: 55 },
  // GPUs
  { pattern: "5090", score: 100 },
  { pattern: "5080", score: 92 },
  { pattern: "5070 ti", score: 82 },
  { pattern: "5070", score: 75 },
  { pattern: "4090", score: 96 },
  { pattern: "4080", score: 87 },
  { pattern: "4070 ti", score: 78 },
  { pattern: "4070 super", score: 74 },
  { pattern: "4070", score: 68 },
  { pattern: "4060 ti", score: 55 },
  { pattern: "4060", score: 45 },
  { pattern: "3060", score: 38 },
  { pattern: "1660", score: 22 },
];

// Works out a score (and whether it was guessed) for one component.
function getScore(component: Component): { score: number; guessed: boolean } {
  if (component.benchmark_score !== null) {
    return { score: component.benchmark_score, guessed: false };
  }

  const nameLower = component.name.toLowerCase();
  const match = KNOWN_MODEL_SCORES.find((m) => nameLower.includes(m.pattern));

  if (match) {
    return { score: match.score, guessed: true };
  }

  // Nothing matched — neutral fallback so the page still works.
  return { score: 50, guessed: true };
}

const RAM_OPTIONS = [
  { key: "8gb", label: "8 GB", multiplier: 0.85 },
  { key: "16gb", label: "16 GB", multiplier: 1.0 },
  { key: "32gb", label: "32 GB", multiplier: 1.03 },
  { key: "64gb", label: "64 GB", multiplier: 1.03 },
];

const RESOLUTIONS = [
  { key: "1080p", label: "1920 × 1080 (1080p)", multiplier: 1.0 },
  { key: "1440p", label: "2560 × 1440 (1440p)", multiplier: 0.72 },
  { key: "4k", label: "3840 × 2160 (4K)", multiplier: 0.45 },
];

// baseFps = roughly what a mid-range system (combined score ~50) gets at
// 1080p. gpuWeight = how much this game leans on the GPU vs CPU (0–1).
const GAMES = [
  { key: "cs2", label: "Counter-Strike 2", baseFps: 220, gpuWeight: 0.55 },
  { key: "cod_bo6", label: "Call of Duty: Black Ops 6", baseFps: 110, gpuWeight: 0.7 },
  { key: "gta5_enhanced", label: "GTA V Enhanced", baseFps: 90, gpuWeight: 0.75 },
  { key: "valorant", label: "Valorant", baseFps: 260, gpuWeight: 0.5 },
  { key: "fortnite", label: "Fortnite", baseFps: 130, gpuWeight: 0.65 },
];

type Results = { gameKey: string; gameLabel: string; fps: number }[];

export default function FpsCalculatorPage() {
  const [cpus, setCpus] = useState<Component[]>([]);
  const [gpus, setGpus] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cpuId, setCpuId] = useState<number | null>(null);
  const [gpuId, setGpuId] = useState<number | null>(null);
  const [ramKey, setRamKey] = useState(RAM_OPTIONS[1].key);
  const [resolutionKey, setResolutionKey] = useState(RESOLUTIONS[0].key);
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchParts() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("components")
        .select("id, name, category, price, benchmark_score")
        .in("category", ["cpu", "gpu"])
        .eq("active", true)
        .order("price", { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as Component[];
      const cpuRows = rows.filter((r) => r.category === "cpu");
      const gpuRows = rows.filter((r) => r.category === "gpu");

      setCpus(cpuRows);
      setGpus(gpuRows);
      setCpuId(cpuRows[0]?.id ?? null);
      setGpuId(gpuRows[0]?.id ?? null);
      setLoading(false);
    }

    fetchParts();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleCalculate() {
    const cpu = cpus.find((c) => c.id === cpuId);
    const gpu = gpus.find((g) => g.id === gpuId);
    if (!cpu || !gpu) return;

    const cpuScore = getScore(cpu).score;
    const gpuScore = getScore(gpu).score;
    const ram = RAM_OPTIONS.find((r) => r.key === ramKey)!;
    const resolution = RESOLUTIONS.find((r) => r.key === resolutionKey)!;

    const computed: Results = GAMES.map((game) => {
      const combinedScore =
        gpuScore * game.gpuWeight + cpuScore * (1 - game.gpuWeight);

      let fps = game.baseFps * (combinedScore / 50);
      fps *= resolution.multiplier;
      fps *= ram.multiplier;
      fps = Math.max(8, Math.min(400, fps));

      return { gameKey: game.key, gameLabel: game.label, fps: Math.round(fps) };
    });

    setResults(computed);
  }

  const maxFps = results ? Math.max(...results.map((r) => r.fps)) : 1;
  const selectedCpu = cpus.find((c) => c.id === cpuId);
  const selectedGpu = gpus.find((g) => g.id === gpuId);
  const cpuGuessed = selectedCpu ? getScore(selectedCpu).guessed : false;
  const gpuGuessed = selectedGpu ? getScore(selectedGpu).guessed : false;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* ---------- Hero ---------- */}
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500">
          <span className="text-red-500">•</span> FPS Calculator
        </div>

        <h1 className="mt-4 text-5xl font-extrabold leading-tight sm:text-6xl">
          Know Your <span className="text-red-500">Frame Rate</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          Pick your specs and monitor resolution, and we&apos;ll estimate your
          FPS in a few popular benchmark games.
        </p>

        <p className="mt-3 max-w-2xl text-sm text-gray-600">
          Estimates are based on relative hardware performance, not
          lab-tested benchmarks — actual FPS varies by game settings,
          drivers, and background software.
        </p>

        {/* ---------- Two-column layout ---------- */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left card: spec inputs */}
          <section className="rounded-2xl border border-red-900/60 bg-[#0D0D0D] p-8">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <span className="h-6 w-1 rounded bg-red-600" />
              Your Specs
            </h2>

            {loading && (
              <p className="mt-6 font-mono text-xs uppercase tracking-widest text-gray-500">
                Loading components…
              </p>
            )}

            {!loading && error && (
              <p className="mt-6 text-sm text-red-500">
                Couldn&apos;t load components: {error}
              </p>
            )}

            {!loading && !error && (
              <div className="mt-6 flex flex-col gap-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Processor
                  </label>
                  <select
                    value={cpuId ?? ""}
                    onChange={(e) => setCpuId(Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white"
                  >
                    {cpus.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {cpuGuessed && (
                    <p className="mt-1 text-xs text-gray-600">
                      Performance for this part is estimated — add a
                      benchmark_score in Supabase for a precise number.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Graphics Card
                  </label>
                  <select
                    value={gpuId ?? ""}
                    onChange={(e) => setGpuId(Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white"
                  >
                    {gpus.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  {gpuGuessed && (
                    <p className="mt-1 text-xs text-gray-600">
                      Performance for this part is estimated — add a
                      benchmark_score in Supabase for a precise number.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Memory
                    </label>
                    <select
                      value={ramKey}
                      onChange={(e) => setRamKey(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white"
                    >
                      {RAM_OPTIONS.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Monitor Resolution
                    </label>
                    <select
                      value={resolutionKey}
                      onChange={(e) => setResolutionKey(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#262626] bg-black px-4 py-3 text-sm text-white"
                    >
                      {RESOLUTIONS.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={!cpuId || !gpuId}
                  className="mt-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Calculate FPS
                </button>
              </div>
            )}
          </section>

          {/* Right card: results */}
          <section className="rounded-2xl border border-red-900/60 bg-[#0D0D0D] p-8">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <span className="h-6 w-1 rounded bg-red-600" />
              Estimated FPS
            </h2>

            {!results ? (
              <p className="mt-6 text-sm text-gray-500">
                Fill in your specs and click &quot;Calculate FPS&quot; to see
                results here.
              </p>
            ) : (
              <div className="mt-6 flex flex-col gap-5">
                {results.map((r) => (
                  <div key={r.gameKey}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{r.gameLabel}</span>
                      <span className="font-semibold text-red-500">
                        {r.fps} FPS
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
                      <div
                        className="h-full rounded-full bg-red-600"
                        style={{ width: `${(r.fps / maxFps) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
