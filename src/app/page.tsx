"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_RECENT_EXPLANATIONS,
  SavedExplanation,
  readRecentExplanations,
  readSavedLibrary,
  writeRecentExplanations,
  writeSavedLibrary
} from "@/lib/library";

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
  const [displayedExplanation, setDisplayedExplanation] = useState("");
  const [error, setError] = useState("");
  const [recentItems, setRecentItems] = useState<SavedExplanation[]>([]);
  const [lastGeneratedItem, setLastGeneratedItem] = useState<SavedExplanation | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecentItems(readRecentExplanations());
  }, []);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!explanation) {
      setDisplayedExplanation("");
      setIsTyping(false);
      return;
    }

    setDisplayedExplanation("");
    setIsTyping(true);
    let index = 0;

    const typeNextCharacter = () => {
      index += 1;
      setDisplayedExplanation(explanation.slice(0, index));

      if (index < explanation.length) {
        typingTimeoutRef.current = setTimeout(typeNextCharacter, 9);
      } else {
        setIsTyping(false);
      }
    };

    typingTimeoutRef.current = setTimeout(typeNextCharacter, 9);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [explanation]);

  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [text]);

  const characterCount = text.length;

  const handleClear = () => {
    setText("");
    setExplanation("");
    setDisplayedExplanation("");
    setError("");
    setIsSaved(false);
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
    setDisplayedExplanation("");
    setIsSaved(false);

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
      const item: SavedExplanation = {
        id: crypto.randomUUID(),
        topic: text.trim(),
        language,
        level,
        explanation: data.explanation,
        createdAt: new Date().toISOString()
      };
      setLastGeneratedItem(item);
      const updatedRecent = [item, ...readRecentExplanations()]
        .filter((recent, index, arr) => arr.findIndex((entry) => entry.explanation === recent.explanation) === index)
        .slice(0, MAX_RECENT_EXPLANATIONS);
      setRecentItems(updatedRecent);
      writeRecentExplanations(updatedRecent);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!lastGeneratedItem || isSaved) return;
    const existing = readSavedLibrary();
    writeSavedLibrary([lastGeneratedItem, ...existing]);
    setIsSaved(true);
  };

  const handlePickRecent = (item: SavedExplanation) => {
    setText(item.topic);
    setLanguage(item.language as (typeof LANGUAGES)[number]);
    setLevel(item.level as (typeof LEVELS)[number]);
    setExplanation(item.explanation);
    setLastGeneratedItem(item);
    setIsSaved(false);
    setError("");
  };

  return (
    <main className="theme-bg min-h-screen px-4 py-10 text-white md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
        <header className="space-y-3 text-center animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Understand faster</h1>
          <p className="text-sm text-white/90 md:text-base">
            Understand anything. In your language. At your level.
          </p>
          <div className="inline-flex rounded-full border border-[#5F57FF]/40 bg-[#5F57FF]/20 px-3 py-1 text-xs font-semibold text-[#C0BCFF]">
            AI Powered
          </div>
        </header>

        <div className="card-glow animate-fade-in">
          <form
            onSubmit={handleSubmit}
            className="theme-surface rounded-2xl border p-4 shadow-[0_0_0_1px_rgba(95,87,255,0.05)] transition-all duration-300 md:p-6"
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
                  className="theme-surface-alt min-h-40 w-full resize-y rounded-xl border p-4 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 focus:border-[#5F57FF] focus:ring-2 focus:ring-[#5F57FF]/30"
                />
                <div className="flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-white/80 transition-all duration-300 hover:border-[#5F57FF] hover:text-white"
                  >
                    Clear
                  </button>
                  <span className="text-right text-white/60">
                    {wordCount} words • {characterCount} characters
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as (typeof LANGUAGES)[number])}
                  className="theme-surface-alt w-full rounded-xl border px-3 py-3 text-sm text-white outline-none transition-all duration-300 hover:border-[#5F57FF] focus:border-[#5F57FF] focus:ring-2 focus:ring-[#5F57FF]/30"
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
                  className="theme-surface-alt w-full rounded-xl border px-3 py-3 text-sm text-white outline-none transition-all duration-300 hover:border-[#5F57FF] focus:border-[#5F57FF] focus:ring-2 focus:ring-[#5F57FF]/30"
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
                className="pulse-on-hover flex w-full items-center justify-center gap-2 rounded-xl bg-[#5F57FF] px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#726CFF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span aria-hidden>⚡</span>
                <span>Explain This</span>
              </button>
            </div>
          </form>
        </div>

        {recentItems.length > 0 && (
          <section className="animate-fade-in">
            <p className="mb-2 text-xs font-semibold text-white/70">Recent explanations</p>
            <div className="flex flex-wrap gap-2">
              {recentItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePickRecent(item)}
                  className="max-w-full truncate rounded-full border border-[#2A3250] bg-[#101728] px-3 py-1.5 text-xs text-[#AFC7FF] transition-colors hover:border-[#79A7FF] hover:text-white"
                  title={item.topic}
                >
                  {item.topic}
                </button>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="theme-surface animate-fade-in flex items-center justify-center gap-2 rounded-xl border p-4 text-sm text-[#06B6D4]">
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
          <div className="animate-fade-in rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!!explanation && !loading && (
          <section className="theme-surface animate-fade-in rounded-2xl border p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="theme-surface-alt rounded-full border px-3 py-1 text-xs text-white/90">
                  {language}
                </span>
                <span className="theme-surface-alt rounded-full border px-3 py-1 text-xs text-white/90">
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
            <p
              className={`whitespace-pre-wrap px-1 text-[15px] leading-7 text-white/95 ${isTyping ? "type-cursor" : ""}`}
            >
              {displayedExplanation}
            </p>
            <button
              type="button"
              onClick={handleSaveToLibrary}
              disabled={isSaved}
              className="mt-4 w-full rounded-xl border border-[#4A80FF] bg-[#2677FF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(38,119,255,0.55)] transition-all duration-300 hover:bg-[#3C89FF] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaved ? "Saved to Library" : "Save to Library"}
            </button>
          </section>
        )}

        <footer className="animate-fade-in pt-2 text-center">
          <p className="text-xs text-white/45">
            Intelligence is equally distributed. Explanation is not. We are fixing that.
          </p>
          <p className="mt-2 text-xs font-semibold text-[#5F57FF]">By Obliquity</p>
        </footer>
      </div>
    </main>
  );
}
