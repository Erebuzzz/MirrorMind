"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-lavender-600 dark:text-lavender-400">
            MirrorMind
          </Link>
          
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                pathname === "/"
                  ? "text-lavender-600 dark:text-lavender-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-lavender-600 dark:hover:text-lavender-400"
              }`}
            >
              Journal
            </Link>
            <Link
              href="/reflections"
              className={`text-sm font-medium transition ${
                pathname === "/reflections"
                  ? "text-lavender-600 dark:text-lavender-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-lavender-600 dark:hover:text-lavender-400"
              }`}
            >
              My Reflections
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
