"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FaChartLine, FaChartBar, FaDollarSign, FaInfoCircle } from "react-icons/fa"

// Utility functions
const formatLargeNumber = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
  return num.toString()
}

const formatCurrency = (num) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// MetricCard component
const MetricCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-gray-800 p-4 rounded-xl border border-gray-700`}>
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <Icon className={`text-${color}-400 text-2xl`} />
    </div>
    <p className="text-2xl font-bold text-white mt-2">{value}</p>
  </div>
)

// PredictionChart component
const PredictionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis
        dataKey="date"
        tick={{ fill: "#9CA3AF" }}
        tickLine={{ stroke: "#4B5563" }}
        tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
      />
      <YAxis
        tick={{ fill: "#9CA3AF" }}
        tickLine={{ stroke: "#4B5563" }}
        tickFormatter={(value) => formatCurrency(value)}
        domain={["dataMin", "dataMax"]}
      />
      <Tooltip
        contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
        labelStyle={{ color: "#F3F4F6" }}
        formatter={(value) => [formatCurrency(value), "Price"]}
        labelFormatter={(label) => new Date(label).toLocaleDateString()}
      />
      <Area type="monotone" dataKey="price" stroke="#3B82F6" fill="url(#colorPrice)" fillOpacity={0.3} />
      <defs>
        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
        </linearGradient>
      </defs>
    </AreaChart>
  </ResponsiveContainer>
)

// VolumeChart component
const VolumeChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="date" tick={{ fill: "#9CA3AF" }} tickLine={{ stroke: "#4B5563" }} />
      <YAxis
        tick={{ fill: "#9CA3AF" }}
        tickLine={{ stroke: "#4B5563" }}
        tickFormatter={(value) => formatLargeNumber(value)}
      />
      <Tooltip
        contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
        labelStyle={{ color: "#F3F4F6" }}
        formatter={(value) => [formatLargeNumber(value), "Volume"]}
      />
      <Bar dataKey="volume" fill="#10B981" />
    </BarChart>
  </ResponsiveContainer>
)

// Generate prediction data function
const generatePredictionData = (currentPrice, days = 180) => {
  const data = []
  let price = currentPrice
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    // More realistic price movement with a slight upward trend
    price = price * (1 + (Math.random() - 0.48) * 0.03)
    data.push({
      date: date.toISOString().split("T")[0],
      price: Number.parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
    })
  }
  return data
}

// Main EnhancedStockDashboard component
const EnhancedStockDashboard = () => {
  const [stockSymbol, setStockSymbol] = useState("")
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [predictionData, setPredictionData] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stockSymbol.trim()) {
      setError("Please enter a stock symbol")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/stockAnalysis?symbol=${stockSymbol.trim()}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setStockData(data)
      setPredictionData(generatePredictionData(data.currentPrice))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
                value={formatLargeNumber(stockData.marketCap)}
                icon={FaDollarSign}
                color="green"
              />
              <MetricCard title="Volume" value={formatLargeNumber(stockData.volume)} icon={FaChartBar} color="purple" />
              <MetricCard
                title="52 Week High"
                value={formatCurrency(stockData.weekHigh52)}
                icon={FaChartLine}
                color="blue"
              />
              <MetricCard
                title="52 Week Low"
                value={formatCurrency(stockData.weekLow52)}
                icon={FaChartLine}
                color="red"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Stock Price Prediction (Next 180 Days)</h3>
                <PredictionChart data={predictionData} />
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Volume Analysis</h3>
                <VolumeChart data={predictionData} />
              </div>
            </div>

            {/* Trading Information and Company Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Trading Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Open</span>
                    <span className="text-white">{formatCurrency(stockData.open)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Previous Close</span>
                    <span className="text-white">{formatCurrency(stockData.previousClose)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Day Range</span>
                    <span className="text-white">
                      {formatCurrency(stockData.low)} - {formatCurrency(stockData.high)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">52 Week Range</span>
                    <span className="text-white">
                      {formatCurrency(stockData.weekLow52)} - {formatCurrency(stockData.weekHigh52)}
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
                          className={`px-3 py-1 rounded-full text-sm ${stockData.analysis.outlook === "bullish"
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