"use client";

import JournalEditor from "@/components/JournalEditor";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Welcome to MirrorMind
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Reflect on your thoughts with AI-powered insights
        </p>
      </div>
      <JournalEditor />
    </div>
  );
}
