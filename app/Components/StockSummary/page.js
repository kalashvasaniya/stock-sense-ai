"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  CpuChipIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon
} from "@heroicons/react/24/outline"
import TradingViewChart from "../charts/TradingViewChart"
import MarketOverview from "../sections/MarketOverview"
import Watchlist from "../sections/Watchlist"

// Utility functions
const formatLargeNumber = (num) => {
  if (num === "N/A" || num === null || num === undefined) return "N/A"
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
  return Number(num).toLocaleString()
}

const formatCurrency = (num) => {
  if (num === "N/A" || num === null || num === undefined) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatPercentage = (num) => {
  if (num === "N/A" || num === null || num === undefined) return "N/A"
  return `${Number(num).toFixed(2)}%`
}

// Enhanced MetricCard component
const MetricCard = React.memo(({ title, value, subtitle, icon: Icon, color, trend, className = "" }) => (
  <motion.div 
    className={`bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all duration-200 ${className}`}
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-3">
          {Icon && (
            <div className={`p-2 rounded-lg bg-${color}-500/10`}>
              <Icon className={`h-5 w-5 text-${color}-500`} />
            </div>
          )}
          <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  </motion.div>
))

// Advanced Chart Components
const PriceChart = ({ data, symbol }) => (
  <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-white">Price Movement (30 Days)</h3>
      <div className="flex items-center space-x-2 text-neutral-400">
        <ChartBarIcon className="h-5 w-5" />
        <span className="text-sm">{symbol}</span>
      </div>
  </div>
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
      <XAxis
        dataKey="date"
          tick={{ fill: "#A3A3A3", fontSize: 12 }}
          tickLine={{ stroke: "#525252" }}
          tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      />
      <YAxis
          tick={{ fill: "#A3A3A3", fontSize: 12 }}
          tickLine={{ stroke: "#525252" }}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
          domain={['dataMin * 0.98', 'dataMax * 1.02']}
      />
      <Tooltip
          contentStyle={{ 
            backgroundColor: "#1C1C1C", 
            border: "1px solid #404040",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
          }}
          labelStyle={{ color: "#F5F5F5" }}
          formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        />
        <Area 
          type="monotone" 
          dataKey="price" 
          stroke="#3B82F6" 
          fill="url(#colorPrice)" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: "#3B82F6" }}
        />
      <defs>
        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
        </linearGradient>
      </defs>
    </AreaChart>
  </ResponsiveContainer>
  </div>
)

const VolumeChart = ({ data }) => (
  <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-white">Volume Analysis</h3>
      <div className="flex items-center space-x-2 text-neutral-400">
        <BarChart className="h-5 w-5" />
        <span className="text-sm">Shares Traded</span>
      </div>
    </div>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: "#A3A3A3", fontSize: 12 }} 
          tickLine={{ stroke: "#525252" }}
          tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
      <YAxis
          tick={{ fill: "#A3A3A3", fontSize: 12 }}
          tickLine={{ stroke: "#525252" }}
        tickFormatter={(value) => formatLargeNumber(value)}
      />
      <Tooltip
          contentStyle={{ 
            backgroundColor: "#1C1C1C", 
            border: "1px solid #404040",
            borderRadius: "8px" 
          }}
          labelStyle={{ color: "#F5F5F5" }}
        formatter={(value) => [formatLargeNumber(value), "Volume"]}
      />
        <Bar dataKey="volume" fill="#10B981" radius={[2, 2, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
  </div>
)

// Analysis Display Component
const AnalysisDisplay = ({ analysis }) => {
  const getOutlookColor = (outlook) => {
    switch (outlook) {
      case 'bullish': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'bearish': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-500'
    if (confidence >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-500/10 p-2 rounded-lg">
          <CpuChipIcon className="h-6 w-6 text-purple-500" />
        </div>
        <h3 className="text-xl font-semibold text-white">AI Analysis</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-neutral-400 mb-2">Summary</h4>
          <p className="text-white leading-relaxed">{analysis.summary}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className={`px-4 py-2 rounded-full border text-sm font-medium ${getOutlookColor(analysis.outlook)}`}>
            {analysis.outlook.toUpperCase()}
          </div>
          <div className="px-4 py-2 rounded-full border border-neutral-700 bg-neutral-800/50 text-neutral-300 text-sm">
            <span className={`font-medium ${getConfidenceColor(analysis.confidence)}`}>
              {analysis.confidence}%
            </span> Confidence
          </div>
        </div>

        {analysis.keyFactors && analysis.keyFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neutral-400 mb-3">Key Factors</h4>
            <div className="grid grid-cols-1 gap-2">
              {analysis.keyFactors.map((factor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-neutral-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.technicalIndicators && (
          <div>
            <h4 className="text-sm font-medium text-neutral-400 mb-3">Technical Indicators</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 p-3 rounded-lg">
                <span className="text-xs text-neutral-500">RSI</span>
                <p className="text-white font-medium">{analysis.technicalIndicators.rsi}</p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded-lg">
                <span className="text-xs text-neutral-500">Trend</span>
                <p className="text-white font-medium">{analysis.technicalIndicators.trend}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Use real historical data from API with intelligent fallback
const prepareChartData = (historicalData, stockData) => {
  // Use real historical data if available
  if (historicalData && historicalData.length > 0) {
    return historicalData.map(item => ({
      date: item.date,
      price: item.price,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume
    }))
  }
  
  // Fallback: Create single data point from current real data
  // This shows the current trading information even when historical API fails
  if (stockData && typeof stockData.currentPrice === 'number') {
    const today = new Date().toISOString().split('T')[0]
    return [{
      date: today,
      price: stockData.currentPrice,
      open: typeof stockData.open === 'number' ? stockData.open : stockData.currentPrice,
      high: typeof stockData.high === 'number' ? stockData.high : stockData.currentPrice,
      low: typeof stockData.low === 'number' ? stockData.low : stockData.currentPrice,
      volume: typeof stockData.volume === 'number' ? stockData.volume : 0
    }]
  }
  
  // If no data at all, return empty array
  return []
}

// Main Component
const EnhancedStockDashboard = () => {
  const [stockSymbol, setStockSymbol] = useState("")
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState([])
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [activeTab, setActiveTab] = useState("analysis")
  const [watchlistSymbol, setWatchlistSymbol] = useState("")

  useEffect(() => {
    const storedTime = localStorage.getItem("lastAnalysisTime")
    if (storedTime) {
      setLastAnalysisTime(parseInt(storedTime, 10))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - lastAnalysisTime
      const remainingTime = Math.max(0, 60000 - elapsedTime) // 1 minute cooldown
      setTimeRemaining(Math.ceil(remainingTime / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [lastAnalysisTime])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stockSymbol.trim()) {
      setError("Please enter a stock symbol")
      return
    }

    const currentTime = Date.now()
    if (currentTime - lastAnalysisTime < 60000) { // 1 minute cooldown
      setError(`Please wait ${timeRemaining} seconds before analyzing again`)
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/stockAnalysis?symbol=${stockSymbol.trim()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch stock data')
      }
      
      setStockData(data)
      setChartData(prepareChartData(data.historicalData, data))
      setLastAnalysisTime(currentTime)
      localStorage.setItem("lastAnalysisTime", currentTime.toString())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isButtonDisabled = loading || timeRemaining > 0

  const handleAnalyzeFromWatchlist = (symbol) => {
    setStockSymbol(symbol)
    setActiveTab("analysis")
    // Trigger analysis with the selected symbol
    const syntheticEvent = { preventDefault: () => {} }
    handleSubmit(syntheticEvent)
  }

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <motion.div
        className="bg-neutral-900 p-2 rounded-2xl border border-neutral-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex bg-neutral-800 rounded-xl p-1">
          {[
            { id: "analysis", label: "Stock Analysis", icon: ChartBarIcon },
            { id: "market", label: "Market Overview", icon: GlobeAltIcon },
            { id: "watchlist", label: "Watchlist", icon: HeartIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-blue-600 text-white"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "analysis" && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Search Section */}
            <motion.div
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">Stock Analysis Dashboard</h2>
                <p className="text-neutral-400">Enter a stock symbol to get comprehensive AI-powered analysis</p>
              </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                className="w-full pl-12 pr-4 py-4 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter stock symbol (e.g., AAPL, TSLA, MSFT)"
                maxLength={10}
              />
            </div>
            <button
              type="submit"
              disabled={isButtonDisabled}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : isButtonDisabled ? (
                <>
                  <ClockIcon className="h-5 w-5" />
                  <span>Wait {timeRemaining}s</span>
                </>
              ) : (
                <>
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center space-x-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Data Display */}
      <AnimatePresence>
        {stockData && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            {/* Company Header */}
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-3xl font-bold text-white">{stockData.companyName}</h2>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium">
                      {stockData.symbol}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-neutral-400">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span>{stockData.sector}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GlobeAltIcon className="h-4 w-4" />
                      <span>{stockData.industry}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white mb-1">
                    {formatCurrency(stockData.currentPrice)}
                  </p>
                  <div className={`flex items-center space-x-2 text-lg font-semibold ${
                    stockData.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {stockData.change >= 0 ? (
                      <ArrowTrendingUpIcon className="h-5 w-5" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-5 w-5" />
                    )}
                    <span>
                      {stockData.change >= 0 ? "+" : ""}{formatCurrency(stockData.change)} 
                      ({stockData.changePercent >= 0 ? "+" : ""}{formatPercentage(stockData.changePercent)})
                    </span>
                  </div>
                  {stockData.timestamp && (
                    <div className="flex items-center space-x-2 text-neutral-400 text-sm mt-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Updated: {new Date(stockData.timestamp).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Market Cap"
                value={formatLargeNumber(stockData.marketCap)}
                icon={BanknotesIcon}
                color="green"
              />
              <MetricCard
                title="Volume"
                value={formatLargeNumber(stockData.volume)}
                icon={ChartBarIcon}
                color="purple"
              />
                              <MetricCard
                  title="52W High"
                value={formatCurrency(stockData.weekHigh52)}
                  icon={ArrowTrendingUpIcon}
                color="blue"
              />
              <MetricCard
                  title="52W Low"
                value={formatCurrency(stockData.weekLow52)}
                  icon={ArrowTrendingDownIcon}
                color="red"
              />
            </div>

            {/* Additional Financial Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <MetricCard
                title="P/E Ratio"
                value={stockData.peRatio}
                subtitle="Price to Earnings"
                icon={InformationCircleIcon}
                color="cyan"
              />
              <MetricCard
                title="EPS"
                value={formatCurrency(stockData.eps)}
                subtitle="Earnings Per Share"
                icon={BanknotesIcon}
                color="emerald"
              />
              <MetricCard
                title="Beta"
                value={stockData.beta}
                subtitle="Market Volatility"
                icon={ChartBarIcon}
                color="orange"
              />
              <MetricCard
                title="Dividend Yield"
                value={formatPercentage(stockData.dividendYield)}
                subtitle="Annual Dividend"
                icon={BanknotesIcon}
                color="green"
              />
              <MetricCard
                title="Book Value"
                value={formatCurrency(stockData.bookValue)}
                subtitle="Per Share"
                icon={BuildingOfficeIcon}
                color="slate"
              />
                              <MetricCard
                  title="Revenue (TTM)"
                  value={formatLargeNumber(stockData.revenue)}
                  subtitle="Trailing Twelve Months"
                  icon={ArrowTrendingUpIcon}
                  color="blue"
                />
              <MetricCard
                title="EBITDA"
                value={formatLargeNumber(stockData.ebitda)}
                subtitle="Earnings Before Interest"
                icon={ChartBarIcon}
                color="purple"
              />
                              <MetricCard
                  title="Profit Margin"
                  value={formatPercentage(stockData.profitMargin)}
                  subtitle="Net Profit Margin"
                  icon={ArrowTrendingUpIcon}
                  color="green"
                />
            </div>

            {/* Advanced Chart Section */}
            <TradingViewChart data={chartData} symbol={stockData.symbol} />

            {/* Trading Information and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trading Information */}
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-blue-500" />
              </div>
                  <span>Trading Information</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                    <span className="text-neutral-400">Open</span>
                    <span className="text-white font-medium">{formatCurrency(stockData.open)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                    <span className="text-neutral-400">Previous Close</span>
                    <span className="text-white font-medium">{formatCurrency(stockData.previousClose)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                    <span className="text-neutral-400">Day Range</span>
                    <span className="text-white font-medium">
                      {formatCurrency(stockData.low)} - {formatCurrency(stockData.high)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                    <span className="text-neutral-400">52 Week Range</span>
                    <span className="text-white font-medium">
                      {formatCurrency(stockData.weekLow52)} - {formatCurrency(stockData.weekHigh52)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-neutral-400">Price to Book</span>
                    <span className="text-white font-medium">{stockData.priceToBook}</span>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {stockData.analysis && <AnalysisDisplay analysis={stockData.analysis} />}
                  </div>

            {/* Company Description */}
            {stockData.description && stockData.description !== "No description available" && (
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-3">
                  <div className="bg-indigo-500/10 p-2 rounded-lg">
                    <InformationCircleIcon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <span>Company Overview</span>
                </h3>
                <p className="text-neutral-300 leading-relaxed">{stockData.description}</p>
                      </div>
            )}

            {/* Data Quality Indicator */}
            {stockData.dataQuality && (
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <h4 className="text-sm font-medium text-neutral-400 mb-3">Data Sources</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(stockData.dataQuality).map(([source, status]) => (
                    <div key={source} className="flex items-center space-x-2">
                      {status === 'success' ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm text-neutral-300 capitalize">{source.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

            {/* Close Analysis Tab */}
          </motion.div>
        )}

                 {activeTab === "market" && (
           <motion.div
             key="market"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.3 }}
           >
             <MarketOverview />
           </motion.div>
         )}

         {activeTab === "watchlist" && (
           <motion.div
             key="watchlist"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.3 }}
           >
             <Watchlist onAnalyzeStock={handleAnalyzeFromWatchlist} />
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedStockDashboard