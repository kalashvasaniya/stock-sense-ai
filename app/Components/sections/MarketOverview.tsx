"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  BanknotesIcon,
  TruckIcon,
  HeartIcon,
  LightBulbIcon,
  HomeIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"

const formatCurrency = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatLargeNumber = (num) => {
  if (typeof num === 'string') return num
  if (typeof num !== 'number' || isNaN(num)) return "N/A"
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "T"
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M"
  return num.toLocaleString()
}

// Real data fetching functions
const fetchMarketData = async () => {
  try {
    // Using Alpha Vantage for real market data
    const symbols = ["SPY", "QQQ", "DIA", "IWM"] // ETFs that track major indices
    const promises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(`/api/stockAnalysis?symbol=${symbol}`)
        if (response.ok) {
          const data = await response.json()
          return {
            symbol: symbol,
            name: symbol === "SPY" ? "S&P 500" : 
                  symbol === "QQQ" ? "Nasdaq 100" :
                  symbol === "DIA" ? "Dow Jones" : "Russell 2000",
            value: data.currentPrice,
            change: data.change,
            changePercent: data.changePercent,
            volume: formatLargeNumber(data.volume)
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${symbol}:`, error)
      }
      return null
    })
    
    const results = await Promise.all(promises)
    return results.filter(Boolean)
  } catch (error) {
    console.error("Failed to fetch market data:", error)
    return []
  }
}

const fetchTopMovers = async () => {
  try {
    // Fetch data for well-known stocks to show as movers
    const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"]
    const promises = popularStocks.map(async (symbol) => {
      try {
        const response = await fetch(`/api/stockAnalysis?symbol=${symbol}`)
        if (response.ok) {
          const data = await response.json()
          return {
            symbol: data.symbol,
            name: data.companyName,
            price: data.currentPrice,
            change: data.change,
            changePercent: data.changePercent
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${symbol}:`, error)
      }
      return null
    })
    
    const results = await Promise.all(promises)
    const validResults = results.filter(Boolean)
    
    // Sort by performance
    const gainers = validResults
      .filter(stock => typeof stock.changePercent === 'number' && stock.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5)
    
    const losers = validResults
      .filter(stock => typeof stock.changePercent === 'number' && stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5)
    
    return { gainers, losers }
  } catch (error) {
    console.error("Failed to fetch market movers:", error)
    return { gainers: [], losers: [] }
  }
}

// Index Card Component
const IndexCard = ({ index, delay = 0 }) => (
  <motion.div
    className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all duration-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-white font-semibold text-lg">{index.name}</h3>
        <p className="text-neutral-400 text-sm">{index.symbol}</p>
      </div>
      <div className="text-right">
        <p className="text-white font-bold text-xl">{formatCurrency(index.value)}</p>
        <div className={`flex items-center space-x-1 ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {index.change >= 0 ? (
            <ArrowTrendingUpIcon className="h-4 w-4" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {typeof index.change === 'number' ? (index.change >= 0 ? '+' : '') + index.change.toFixed(2) : 'N/A'} ({typeof index.changePercent === 'number' ? (index.changePercent >= 0 ? '+' : '') + index.changePercent.toFixed(2) : 'N/A'}%)
          </span>
        </div>
      </div>
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
      <span className="text-neutral-400 text-sm">Volume</span>
      <span className="text-white text-sm font-medium">{index.volume}</span>
    </div>
  </motion.div>
)

// Market Movers Component
const MarketMovers = ({ movers }) => {
  const [activeTab, setActiveTab] = useState("gainers")
  const currentData = activeTab === "gainers" ? movers.gainers : movers.losers

  if (!currentData || currentData.length === 0) {
    return (
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-xl font-semibold text-white mb-4">Market Movers</h3>
        <p className="text-neutral-400">Loading market data...</p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Market Movers</h3>
        <div className="flex bg-neutral-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("gainers")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "gainers"
                ? "bg-green-600 text-white"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            Top Gainers
          </button>
          <button
            onClick={() => setActiveTab("losers")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "losers"
                ? "bg-red-600 text-white"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            Top Losers
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {currentData.map((stock, index) => (
          <motion.div
            key={stock.symbol}
            className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="text-white font-medium">{stock.symbol}</span>
                <span className="text-neutral-400 text-sm truncate">{stock.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{formatCurrency(stock.price)}</p>
              <div className={`flex items-center space-x-1 ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.changePercent >= 0 ? (
                  <ArrowTrendingUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3" />
                )}
                <span className="text-xs">
                  {typeof stock.changePercent === 'number' ? (stock.changePercent >= 0 ? '+' : '') + stock.changePercent.toFixed(2) : 'N/A'}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Main Market Overview Component
const MarketOverview = ({ className = "" }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [marketIndices, setMarketIndices] = useState([])
  const [marketMovers, setMarketMovers] = useState({ gainers: [], losers: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMarketData = async () => {
      setLoading(true)
      try {
        const [indices, movers] = await Promise.all([
          fetchMarketData(),
          fetchTopMovers()
        ])
        
        setMarketIndices(indices)
        setMarketMovers(movers)
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Failed to load market data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMarketData()

    // Refresh data every 5 minutes
    const interval = setInterval(loadMarketData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-blue-500/10 p-3 rounded-xl">
            <GlobeAltIcon className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">Market Overview</h2>
        </div>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Real-time market data including major indices and top market movers.
        </p>
        <p className="text-neutral-500 text-sm mt-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </motion.div>

      {/* Market Indices */}
      <div>
        <motion.h3
          className="text-xl font-semibold text-white mb-6 flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChartBarIcon className="h-6 w-6 text-blue-500" />
          <span>Major Indices</span>
        </motion.h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 animate-pulse">
                <div className="h-4 bg-neutral-800 rounded mb-2"></div>
                <div className="h-6 bg-neutral-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : marketIndices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketIndices.map((index, i) => (
              <IndexCard key={index.symbol} index={index} delay={0.1 * i} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
            <p className="text-neutral-400 text-center">Unable to load market indices data</p>
          </div>
        )}
      </div>

      {/* Market Movers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <MarketMovers movers={marketMovers} />
      </motion.div>

      {/* Market Stats */}
      <motion.div
        className="bg-neutral-900 p-6 rounded-xl border border-neutral-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h3 className="text-xl font-semibold text-white mb-6">Market Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{marketMovers.gainers.length}</p>
            <p className="text-neutral-400 text-sm">Top Gainers Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{marketMovers.losers.length}</p>
            <p className="text-neutral-400 text-sm">Top Losers Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{marketIndices.length}</p>
            <p className="text-neutral-400 text-sm">Market Indices</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MarketOverview 