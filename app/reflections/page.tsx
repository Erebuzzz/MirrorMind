"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getReflections, clearAllReflections } from "@/lib/storage";
import type { JournalEntry } from "@/lib/types";

export default function ReflectionsPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await getReflections();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete all reflections? This cannot be undone.")) {
      await clearAllReflections();
      setEntries([]);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      positive: "😊",
      hopeful: "🌟",
      calm: "😌",
      neutral: "😐",
      negative: "😔",
      anxious: "😰",
    };
    return moodMap[mood.toLowerCase()] || "💭";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
          My Reflections
        </h1>
        {entries.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            No reflections yet. Start journaling to see your entries here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {formatDate(entry.date)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(entry.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-lavender-600 dark:text-lavender-400 mb-1">
                    Mood: {entry.mood}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Summary
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {entry.summary}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI Response
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                    {entry.reflection}
                  </p>
                </div>

                {entry.text && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300">
                      View original entry
                    </summary>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {entry.text}
                    </p>
                  </details>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
