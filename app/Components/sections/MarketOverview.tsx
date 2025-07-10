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

// Mock data for market indices
const marketIndices = [
  {
    symbol: "SPX",
    name: "S&P 500",
    value: 4756.23,
    change: 23.45,
    changePercent: 0.49,
    volume: "3.2B"
  },
  {
    symbol: "DJI",
    name: "Dow Jones",
    value: 37689.54,
    change: 156.87,
    changePercent: 0.42,
    volume: "285M"
  },
  {
    symbol: "IXIC",
    name: "Nasdaq",
    value: 14845.73,
    change: -45.23,
    changePercent: -0.30,
    volume: "4.1B"
  },
  {
    symbol: "RUT",
    name: "Russell 2000",
    value: 2087.45,
    change: 8.92,
    changePercent: 0.43,
    volume: "1.8B"
  }
]

// Mock data for sectors
const sectorData = [
  {
    name: "Technology",
    symbol: "XLK",
    change: 1.24,
    changePercent: 0.85,
    icon: CpuChipIcon,
    color: "blue",
    marketCap: "12.4T",
    topStocks: ["AAPL", "MSFT", "NVDA"]
  },
  {
    name: "Financial",
    symbol: "XLF",
    change: 0.87,
    changePercent: 0.56,
    icon: BanknotesIcon,
    color: "green",
    marketCap: "8.9T",
    topStocks: ["JPM", "BAC", "WFC"]
  },
  {
    name: "Healthcare",
    symbol: "XLV",
    change: -0.23,
    changePercent: -0.18,
    icon: HeartIcon,
    color: "red",
    marketCap: "6.7T",
    topStocks: ["JNJ", "PFE", "UNH"]
  },
  {
    name: "Energy",
    symbol: "XLE",
    change: 2.45,
    changePercent: 1.87,
    icon: LightBulbIcon,
    color: "orange",
    marketCap: "1.8T",
    topStocks: ["XOM", "CVX", "COP"]
  },
  {
    name: "Industrial",
    symbol: "XLI",
    change: 0.94,
    changePercent: 0.72,
    icon: TruckIcon,
    color: "purple",
    marketCap: "4.2T",
    topStocks: ["BA", "CAT", "GE"]
  },
  {
    name: "Real Estate",
    symbol: "XLRE",
    change: -0.56,
    changePercent: -0.41,
    icon: HomeIcon,
    color: "indigo",
    marketCap: "1.4T",
    topStocks: ["AMT", "PLD", "CCI"]
  },
  {
    name: "Utilities",
    symbol: "XLU",
    change: 0.12,
    changePercent: 0.09,
    icon: ShieldCheckIcon,
    color: "teal",
    marketCap: "1.1T",
    topStocks: ["NEE", "SO", "DUK"]
  },
  {
    name: "Consumer",
    symbol: "XLY",
    change: 1.67,
    changePercent: 1.23,
    icon: BuildingOfficeIcon,
    color: "pink",
    marketCap: "5.6T",
    topStocks: ["AMZN", "TSLA", "HD"]
  }
]

// Mock market movers data
const marketMovers = {
  gainers: [
    { symbol: "NVDA", name: "NVIDIA Corp", price: 892.45, change: 45.67, changePercent: 5.39 },
    { symbol: "AMD", name: "Advanced Micro Devices", price: 187.23, change: 8.94, changePercent: 5.01 },
    { symbol: "TSLA", name: "Tesla Inc", price: 234.56, change: 9.87, changePercent: 4.39 },
    { symbol: "META", name: "Meta Platforms", price: 387.90, change: 12.34, changePercent: 3.28 },
    { symbol: "GOOGL", name: "Alphabet Inc", price: 145.67, change: 4.23, changePercent: 2.99 }
  ],
  losers: [
    { symbol: "INTC", name: "Intel Corporation", price: 43.21, change: -2.87, changePercent: -6.23 },
    { symbol: "IBM", name: "International Business Machines", price: 158.90, change: -7.45, changePercent: -4.48 },
    { symbol: "GE", name: "General Electric", price: 98.76, change: -3.21, changePercent: -3.15 },
    { symbol: "F", name: "Ford Motor Company", price: 12.34, change: -0.34, changePercent: -2.68 },
    { symbol: "T", name: "AT&T Inc", price: 18.92, change: -0.45, changePercent: -2.32 }
  ]
}

const formatCurrency = (num) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatLargeNumber = (num) => {
  if (typeof num === 'string') return num
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "T"
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M"
  return num.toLocaleString()
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
        <p className="text-white font-bold text-xl">{formatLargeNumber(index.value)}</p>
        <div className={`flex items-center space-x-1 ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {index.change >= 0 ? (
            <ArrowTrendingUpIcon className="h-4 w-4" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
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

// Sector Card Component
const SectorCard = ({ sector, delay = 0 }) => (
  <motion.div
    className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all duration-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-${sector.color}-500/10`}>
          <sector.icon className={`h-5 w-5 text-${sector.color}-500`} />
        </div>
        <div>
          <h4 className="text-white font-medium">{sector.name}</h4>
          <p className="text-neutral-400 text-xs">{sector.symbol}</p>
        </div>
      </div>
      <div className={`flex items-center space-x-1 ${sector.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {sector.change >= 0 ? (
          <ArrowTrendingUpIcon className="h-3 w-3" />
        ) : (
          <ArrowTrendingDownIcon className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">
          {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-400">Market Cap</span>
        <span className="text-white">{sector.marketCap}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-400">Top Holdings</span>
        <span className="text-white text-xs">{sector.topStocks.join(", ")}</span>
      </div>
    </div>
  </motion.div>
)

// Market Movers Component
const MarketMovers = () => {
  const [activeTab, setActiveTab] = useState("gainers")

  const currentData = activeTab === "gainers" ? marketMovers.gainers : marketMovers.losers

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
              <div className={`flex items-center space-x-1 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3" />
                )}
                <span className="text-xs">
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
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

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 60000) // Update every minute

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
          Real-time market data including major indices, sector performance, and top market movers.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketIndices.map((index, i) => (
            <IndexCard key={index.symbol} index={index} delay={0.1 * i} />
          ))}
        </div>
      </div>

      {/* Sector Performance */}
      <div>
        <motion.h3
          className="text-xl font-semibold text-white mb-6 flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <BuildingOfficeIcon className="h-6 w-6 text-green-500" />
          <span>Sector Performance</span>
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sectorData.map((sector, i) => (
            <SectorCard key={sector.symbol} sector={sector} delay={0.05 * i} />
          ))}
        </div>
      </div>

      {/* Market Movers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <MarketMovers />
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
            <p className="text-2xl font-bold text-green-500">2,847</p>
            <p className="text-neutral-400 text-sm">Advancing Stocks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">1,234</p>
            <p className="text-neutral-400 text-sm">Declining Stocks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">$8.7T</p>
            <p className="text-neutral-400 text-sm">Total Market Volume</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MarketOverview 