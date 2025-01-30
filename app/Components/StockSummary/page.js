"use client"
import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Line, AreaChart, Area, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FaChartLine, FaChartBar, FaDollarSign, FaInfoCircle } from "react-icons/fa"
import { MetricCard } from "../MetricCard"

const EnhancedStockDashboard = () => {
  const [stockSymbol, setStockSymbol] = useState("")
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stockSymbol.trim()) {
      setError("Please enter a stock symbol")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://stock-sense-openai.vercel.app/api/stockAnalysis?symbol=${stockSymbol.trim()}`,
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setStockData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const mockChartData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 4500 },
    { name: "May", value: 6000 },
    { name: "Jun", value: 5500 },
  ]

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Advanced Stock Analysis Dashboard
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter stock symbol (e.g., AAPL)"
              maxLength={5}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? "Loading..." : "Analyze"}
            </button>
          </div>
        </motion.form>

        {error && (
          <motion.div
            className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaInfoCircle className="inline-block mr-2" />
            {error}
          </motion.div>
        )}

        {stockData && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Company Header */}
            <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{stockData.companyName}</h2>
                  <p className="text-gray-400">
                    {stockData.symbol} • {stockData.sector}
                  </p>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                  <p className="text-2xl sm:text-3xl font-bold text-white">${stockData.currentPrice.toFixed(2)}</p>
                  <p className={`text-lg ${stockData.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {stockData.change >= 0 ? "+" : ""}
                    {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Market Cap"
                value={`$${(stockData.marketCap / 1e9).toFixed(2)}B`}
                icon={FaDollarSign}
                color="green"
              />
              <MetricCard title="Volume" value={stockData.volume.toLocaleString()} icon={FaChartBar} color="purple" />
              <MetricCard
                title="52 Week High"
                value={`$${stockData.weekHigh52.toFixed(2)}`}
                icon={FaChartLine}
                color="blue"
              />
              <MetricCard
                title="52 Week Low"
                value={`$${stockData.weekLow52.toFixed(2)}`}
                icon={FaChartLine}
                color="red"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Stock Price Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Volume Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trading Information and Company Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Trading Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Open</span>
                    <span className="text-white">${stockData.open.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Previous Close</span>
                    <span className="text-white">${stockData.previousClose.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Day Range</span>
                    <span className="text-white">
                      ${stockData.low.toFixed(2)} - ${stockData.high.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">52 Week Range</span>
                    <span className="text-white">
                      ${stockData.weekLow52.toFixed(2)} - ${stockData.weekHigh52.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Company Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Industry</span>
                    <span className="text-white">{stockData.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sector</span>
                    <span className="text-white">{stockData.sector}</span>
                  </div>
                  {stockData.analysis && (
                    <div className="mt-4">
                      <h4 className="text-gray-400 mb-2">AI Analysis</h4>
                      <p className="text-white">{stockData.analysis.summary}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            stockData.analysis.outlook === "bullish"
                              ? "bg-green-500/20 text-green-400"
                              : stockData.analysis.outlook === "bearish"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {stockData.analysis.outlook.toUpperCase()}
                        </span>
                        <span className="text-gray-400">Confidence: {stockData.analysis.confidence}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default EnhancedStockDashboard

