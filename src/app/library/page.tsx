"use client";

import { useEffect, useState } from "react";
import { SavedExplanation, readSavedLibrary, writeSavedLibrary } from "@/lib/library";

export default function LibraryPage() {
  const [items, setItems] = useState<SavedExplanation[]>([]);

  useEffect(() => {
    setItems(readSavedLibrary());
  }, []);

  const handleDelete = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    writeSavedLibrary(updated);
  };

  return (
    <main className="theme-bg min-h-screen px-4 py-10 text-white md:px-6">
      <section className="mx-auto w-full max-w-5xl animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your Library</h1>
        <p className="mt-2 text-sm text-white/75">Saved explanations you want to revisit later.</p>

        {items.length === 0 ? (
          <div className="theme-surface mt-6 rounded-2xl border p-6 text-sm text-white/70">
            No saved explanations yet. Generate one on the home page and hit Save to Library.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="theme-surface animate-fade-in rounded-2xl border p-4 shadow-[0_0_0_1px_rgba(95,87,255,0.05)]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="theme-surface-alt rounded-full border px-3 py-1 text-xs text-white/85">
                      {item.language}
                    </span>
                    <span className="theme-surface-alt rounded-full border px-3 py-1 text-xs text-white/85">
                      {item.level}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="max-h-12 overflow-hidden text-base font-semibold text-white">{item.topic}</h2>
                <p className="mt-2 max-h-40 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-white/85">
                  {item.explanation}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="mt-4 rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-medium text-red-200 transition-colors hover:border-red-300 hover:text-red-100"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
