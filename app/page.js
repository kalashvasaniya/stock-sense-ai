"use client";
import StockSummary from "../app/Components/StockSummary/page";

export default function Home() {
  return (
    <div className="min-h-screen bg-black p-8">
      <header className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
          StockSenseAI
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mt-4">
          Making stock market insights simple, actionable, and AI-driven.
        </p>
      </header>
      <main className="mx-auto">
        <StockSummary />
      </main>
    </div>
  );
}