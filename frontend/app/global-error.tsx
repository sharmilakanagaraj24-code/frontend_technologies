'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-xs text-slate-500 mb-4">
            An unexpected error occurred in the application.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
