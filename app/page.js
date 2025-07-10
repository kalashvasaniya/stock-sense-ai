"use client";
import StockSummary from "../app/Components/StockSummary/page";
import ErrorBoundary from "../app/Components/ErrorBoundary";
import { motion } from "framer-motion";
import { ArrowTrendingUpIcon, ChartBarIcon, GlobeAltIcon, CpuChipIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">StockSense AI</h1>
                <p className="text-neutral-400 text-xs sm:text-sm">Intelligent Stock Market Analysis</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-neutral-300">
                <CpuChipIcon className="h-5 w-5" />
                <span className="text-sm">AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-300">
                <GlobeAltIcon className="h-5 w-5" />
                <span className="text-sm">Real-time Data</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-300">
                <ChartBarIcon className="h-5 w-5" />
                <span className="text-sm">Advanced Analytics</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Make Smarter
              <span className="block text-blue-500">Investment Decisions</span>
            </h2>
            <p className="text-lg sm:text-xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to analyze stocks with precision. 
              Get comprehensive insights, real-time data, and expert-level analysis at your fingertips.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-neutral-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live Market Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Advanced Charts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Technical Indicators</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-colors">
                          <div className="bg-blue-600/10 p-3 rounded-xl w-fit mb-4">
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-500" />
            </div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-time Analysis</h3>
              <p className="text-neutral-400 leading-relaxed">
                Get instant stock analysis with live market data, price movements, and comprehensive financial metrics.
              </p>
            </div>

            <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="bg-green-600/10 p-3 rounded-xl w-fit mb-4">
                <CpuChipIcon className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Insights</h3>
              <p className="text-neutral-400 leading-relaxed">
                Advanced AI algorithms analyze market trends, sentiment, and technical indicators to provide actionable insights.
              </p>
            </div>

            <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="bg-purple-600/10 p-3 rounded-xl w-fit mb-4">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Charting</h3>
              <p className="text-neutral-400 leading-relaxed">
                Interactive charts with technical indicators, volume analysis, and customizable time frames for detailed market analysis.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <ErrorBoundary>
              <StockSummary />
            </ErrorBoundary>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-semibold">StockSense AI</span>
            </div>
            <div className="text-neutral-400 text-sm text-center md:text-right">
              <p>© 2024 StockSense AI. All rights reserved.</p>
              <p className="mt-1">Powered by advanced AI and real-time market data</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}