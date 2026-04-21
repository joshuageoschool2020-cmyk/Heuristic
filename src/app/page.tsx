"use client";

import { FormEvent, useMemo, useState } from "react";

const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
  "Sanskrit",
  "Konkani",
  "Manipuri",
  "Nepali",
  "Sindhi",
  "Dogri",
  "Bodo",
  "Santhali",
  "Maithili"
] as const;

const LEVELS = ["Age 10", "Age 15", "University"] as const;

export default function Home() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("English");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("University");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [text]);

  const handleClear = () => {
    setText("");
    setExplanation("");
    setError("");
  };

  const handleCopy = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation);
    } catch {
      setError("Unable to copy explanation.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Please enter something to explain.");
      return;
    }

    setLoading(true);
    setError("");
    setExplanation("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language, level })
      });

      const data = (await response.json()) as { explanation?: string; error?: string };
      if (!response.ok || !data.explanation) {
        throw new Error(data.error || "Could not generate explanation.");
      }

      setExplanation(data.explanation);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0F] px-4 py-10 text-white md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">heuristic_</h1>
          <p className="text-sm text-white/90 md:text-base">
            Understand anything. In your language. At your level.
          </p>
          <div className="inline-flex rounded-full border border-[#5F57FF]/40 bg-[#5F57FF]/20 px-3 py-1 text-xs font-semibold text-[#C0BCFF]">
            AI Powered
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#1E1E2E] bg-[#13131A] p-4 shadow-[0_0_0_1px_rgba(95,87,255,0.05)] transition-all duration-300 md:p-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold md:text-xl">
                What do you want to understand?
              </h2>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste any text, topic, exam question or concept here."
                className="min-h-40 w-full resize-y rounded-xl border border-[#1E1E2E] bg-[#0E0E14] p-4 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 focus:border-[#5F57FF] focus:ring-2 focus:ring-[#5F57FF]/30"
              />
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg border border-[#1E1E2E] px-3 py-1.5 text-white/80 transition-all duration-300 hover:border-[#5F57FF] hover:text-white"
                >
                  Clear
                </button>
                <span className="text-white/60">{wordCount} words</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as (typeof LANGUAGES)[number])}
                className="w-full rounded-xl border border-[#1E1E2E] bg-[#0E0E14] px-3 py-3 text-sm text-white outline-none transition-all duration-300 hover:border-[#5F57FF] focus:border-[#5F57FF] focus:ring-2 focus:ring-[#5F57FF]/30"
              >
                {LANGUAGES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as (typeof LEVELS)[number])}
                className="w-full rounded-xl border border-[#1E1E2E] bg-[#0E0E14] px-3 py-3 text-sm text-white outline-none transition-all duration-300 hover:border-[#5F57FF] focus:border-[#5F57FF] focus:ring-2 focus:ring-[#5F57FF]/30"
              >
                {LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5F57FF] px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#726CFF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span aria-hidden>⚡</span>
              <span>Explain This</span>
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-[#1E1E2E] bg-[#13131A] p-4 text-sm text-[#06B6D4]">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#06B6D4]" />
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-[#06B6D4]"
                style={{ animationDelay: "180ms" }}
              />
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-[#06B6D4]"
                style={{ animationDelay: "360ms" }}
              />
            </div>
            <span>Heuristic is thinking...</span>
          </div>
        )}

        {!!error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!!explanation && !loading && (
          <section className="rounded-2xl border border-[#1E1E2E] bg-[#13131A] p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#1E1E2E] bg-[#0E0E14] px-3 py-1 text-xs text-white/90">
                  {language}
                </span>
                <span className="rounded-full border border-[#1E1E2E] bg-[#0E0E14] px-3 py-1 text-xs text-white/90">
                  {level}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-[#1E1E2E] px-3 py-1.5 text-xs font-medium text-white/90 transition-all duration-300 hover:border-[#06B6D4] hover:text-white"
              >
                Copy
              </button>
            </div>
            <p className="whitespace-pre-wrap px-1 text-[15px] leading-7 text-white/95">
              {explanation}
            </p>
          </section>
        )}

        <footer className="pt-2 text-center">
          <p className="text-xs text-white/45">
            Intelligence is equally distributed. Explanation is not. We are fixing that.
          </p>
          <p className="mt-2 text-xs font-semibold text-[#5F57FF]">By Obliquity</p>
        </footer>
      </div>
    </main>
  );
}
