import StockSummary from "../app/Components/StockSummary/page";

export default function Home() {
  return (
    <div className="min-h-screen bg-black p-8">
      <header className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
          StockSenseAI
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mt-4">
          Making stock market insights simple, actionable, and AI-driven.
        </p>
      </header>
      <main className="max-w-4xl mx-auto">
        <StockSummary />
      </main>
    </div>
  );
}
