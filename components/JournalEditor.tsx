"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveReflection, shouldUseAPI } from "@/lib/storage";
import type { AnalysisResult } from "@/lib/types";

export default function JournalEditor() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useAdvancedAI, setUseAdvancedAI] = useState(true);

  const handleReflect = async () => {
    if (!text.trim()) {
      setError("Please write something before reflecting.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let analysis: AnalysisResult;

      if (shouldUseAPI() || useAdvancedAI) {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text, 
            useHuggingFace: useAdvancedAI 
          }),
        });

        const result = await response.json();

        if (result.success) {
          analysis = result.data;
        } else {
          throw new Error(result.error || "Analysis failed");
        }
      } else {
        const { analyzeJournal } = await import("@/lib/ai");
        analysis = await analyzeJournal(text, false);
      }

      setResult(analysis);
      
      await saveReflection({
        text,
        summary: analysis.summary,
        mood: analysis.mood,
        reflection: analysis.reflection,
      });
    } catch (err: any) {
      setError(err.message || "Failed to analyze your journal. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const motivationalQuotes = [
    "Every day is a fresh start.",
    "Your thoughts shape your reality.",
    "Progress, not perfection.",
    "Self-awareness is the first step to growth.",
    "Be kind to yourself.",
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <label htmlFor="journal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            How are you feeling today?
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="advanced-ai"
              checked={useAdvancedAI}
              onChange={(e) => setUseAdvancedAI(e.target.checked)}
              className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
            />
            <label htmlFor="advanced-ai" className="text-sm text-gray-600 dark:text-gray-400">
              Advanced AI (HuggingFace)
            </label>
          </div>
        </div>
        <textarea
          id="journal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing your thoughts..."
          className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent resize-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {text.length} characters
            </p>
            {useAdvancedAI && (
              <p className="text-xs text-lavender-600 dark:text-lavender-400">
                Using HuggingFace models for better accuracy
              </p>
            )}
          </div>
          <button
            onClick={handleReflect}
            disabled={isAnalyzing || !text.trim()}
            className="px-6 py-3 bg-lavender-600 hover:bg-lavender-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Reflecting..." : "Reflect"}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Your Reflection
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-lavender-600 dark:text-lavender-400 mb-1">
                  Mood Detected
                </h3>
                <p className="text-gray-700 dark:text-gray-300 capitalize">
                  {result.mood}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-lavender-600 dark:text-lavender-400 mb-1">
                  Summary
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {result.summary}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-lavender-600 dark:text-lavender-400 mb-1">
                  AI Response
                </h3>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {result.reflection}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
                  &ldquo;{randomQuote}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
