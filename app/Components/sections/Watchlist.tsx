"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  StarIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  BellIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline"
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid"

// Mock stock data for demonstration
const mockStockData = {
  "AAPL": { name: "Apple Inc.", price: 189.95, change: 2.87, changePercent: 1.54, volume: "65.2M", marketCap: "2.98T" },
  "MSFT": { name: "Microsoft Corporation", price: 378.85, change: -1.23, changePercent: -0.32, volume: "28.4M", marketCap: "2.81T" },
  "GOOGL": { name: "Alphabet Inc.", price: 145.67, change: 4.23, changePercent: 2.99, volume: "31.7M", marketCap: "1.85T" },
  "AMZN": { name: "Amazon.com Inc.", price: 151.94, change: -0.89, changePercent: -0.58, volume: "42.1M", marketCap: "1.57T" },
  "TSLA": { name: "Tesla Inc.", price: 234.56, change: 9.87, changePercent: 4.39, volume: "89.3M", marketCap: "746B" },
  "META": { name: "Meta Platforms Inc.", price: 387.90, change: 12.34, changePercent: 3.28, volume: "19.8M", marketCap: "968B" },
  "NVDA": { name: "NVIDIA Corporation", price: 892.45, change: 45.67, changePercent: 5.39, volume: "25.6M", marketCap: "2.2T" },
  "AMD": { name: "Advanced Micro Devices", price: 187.23, change: 8.94, changePercent: 5.01, volume: "34.2M", marketCap: "302B" },
  "NFLX": { name: "Netflix Inc.", price: 456.78, change: -3.45, changePercent: -0.75, volume: "7.8M", marketCap: "203B" },
  "CRM": { name: "Salesforce Inc.", price: 267.89, change: 6.54, changePercent: 2.50, volume: "5.4M", marketCap: "261B" }
}

const formatCurrency = (num) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatLargeNumber = (str) => {
  if (typeof str === 'string') return str
  if (str >= 1e12) return (str / 1e12).toFixed(1) + "T"
  if (str >= 1e9) return (str / 1e9).toFixed(1) + "B"
  if (str >= 1e6) return (str / 1e6).toFixed(1) + "M"
  return str.toLocaleString()
}

// Stock Search Component
const StockSearch = ({ onAddStock, watchlist }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [filteredStocks, setFilteredStocks] = useState([])

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = Object.entries(mockStockData)
        .filter(([symbol, data]) => 
          symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(([symbol]) => !watchlist.some(stock => stock.symbol === symbol))
        .slice(0, 5)
      
      setFilteredStocks(filtered)
      setIsSearchOpen(true)
    } else {
      setFilteredStocks([])
      setIsSearchOpen(false)
    }
  }, [searchTerm, watchlist])

  const handleAddStock = (symbol, data) => {
    onAddStock({ symbol, ...data })
    setSearchTerm("")
    setIsSearchOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search stocks to add..."
          className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <AnimatePresence>
        {isSearchOpen && filteredStocks.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filteredStocks.map(([symbol, data]) => (
              <motion.button
                key={symbol}
                onClick={() => handleAddStock(symbol, data)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors flex items-center justify-between"
                whileHover={{ backgroundColor: "#404040" }}
              >
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">{symbol}</span>
                    <span className="text-neutral-400 text-sm truncate">{data.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(data.price)}</p>
                  <p className={`text-sm ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Watchlist Item Component
const WatchlistItem = ({ stock, onRemove, onAnalyze, index }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all duration-200"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-white font-semibold text-lg">{stock.symbol}</h3>
            <AnimatePresence>
              {isHovered && (
                <motion.button
                  onClick={() => onRemove(stock.symbol)}
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <XMarkIcon className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <p className="text-neutral-400 text-sm line-clamp-1">{stock.name}</p>
        </div>
        
        <div className="text-right">
          <p className="text-white font-bold text-xl mb-1">{formatCurrency(stock.price)}</p>
          <div className={`flex items-center space-x-1 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stock.change >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-neutral-400 text-xs">Volume</span>
          <p className="text-white text-sm font-medium">{stock.volume}</p>
        </div>
        <div>
          <span className="text-neutral-400 text-xs">Market Cap</span>
          <p className="text-white text-sm font-medium">{stock.marketCap}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onAnalyze(stock.symbol)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <ChartBarIcon className="h-4 w-4" />
          <span>Analyze</span>
        </button>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2 px-3 rounded-lg transition-colors">
          <BellIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Portfolio Summary Component
const PortfolioSummary = ({ watchlist }) => {
  const totalValue = watchlist.reduce((sum, stock) => sum + stock.price, 0)
  const totalChange = watchlist.reduce((sum, stock) => sum + stock.change, 0)
  const avgChangePercent = watchlist.length > 0 
    ? watchlist.reduce((sum, stock) => sum + stock.changePercent, 0) / watchlist.length 
    : 0

  const gainers = watchlist.filter(stock => stock.change > 0).length
  const losers = watchlist.filter(stock => stock.change < 0).length

  return (
    <motion.div
      className="bg-neutral-900 p-6 rounded-xl border border-neutral-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
        <ChartBarIcon className="h-6 w-6 text-blue-500" />
        <span>Portfolio Summary</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{watchlist.length}</p>
          <p className="text-neutral-400 text-sm">Stocks Tracked</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
          <p className="text-neutral-400 text-sm">Total Value</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(totalChange)}
          </p>
          <p className="text-neutral-400 text-sm">Total Change</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${avgChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {avgChangePercent >= 0 ? '+' : ''}{avgChangePercent.toFixed(2)}%
          </p>
          <p className="text-neutral-400 text-sm">Avg Change</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-neutral-300 text-sm">{gainers} Gainers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-neutral-300 text-sm">{losers} Losers</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-neutral-400 text-sm">
            <ClockIcon className="h-4 w-4" />
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Main Watchlist Component
const Watchlist = ({ className = "", onAnalyzeStock }) => {
  const [watchlist, setWatchlist] = useState([])
  const [sortBy, setSortBy] = useState("symbol")
  const [sortOrder, setSortOrder] = useState("asc")

  // Load watchlist from localStorage on component mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("stockWatchlist")
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist)
        setWatchlist(parsed)
      } catch (error) {
        console.error("Error loading watchlist:", error)
      }
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("stockWatchlist", JSON.stringify(watchlist))
  }, [watchlist])

  // Mock data refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(stock => {
        const mockData = mockStockData[stock.symbol]
        if (mockData) {
          // Add small random variation to simulate real-time updates
          const priceVariation = (Math.random() - 0.5) * 0.02 // ±1% variation
          const newPrice = mockData.price * (1 + priceVariation)
          const newChange = newPrice - mockData.price
          const newChangePercent = (newChange / mockData.price) * 100

          return {
            ...stock,
            price: Number(newPrice.toFixed(2)),
            change: Number(newChange.toFixed(2)),
            changePercent: Number(newChangePercent.toFixed(2))
          }
        }
        return stock
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const addStock = useCallback((stock) => {
    setWatchlist(prev => [...prev, stock])
  }, [])

  const removeStock = useCallback((symbol) => {
    setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol))
  }, [])

  const analyzeStock = useCallback((symbol) => {
    if (onAnalyzeStock) {
      onAnalyzeStock(symbol)
    }
  }, [onAnalyzeStock])

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

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
          <div className="bg-purple-500/10 p-3 rounded-xl">
            <HeartIcon className="h-8 w-8 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">Stock Watchlist</h2>
        </div>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Track your favorite stocks and monitor their performance in real-time. Add stocks to your watchlist and get instant analysis.
        </p>
      </motion.div>

      {/* Add Stock Section */}
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StockSearch onAddStock={addStock} watchlist={watchlist} />
      </motion.div>

      {/* Portfolio Summary */}
      {watchlist.length > 0 && <PortfolioSummary watchlist={watchlist} />}

      {/* Sort Controls */}
      {watchlist.length > 0 && (
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-white">Your Watchlist ({watchlist.length})</h3>
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="symbol">Symbol</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="changePercent">Change %</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm hover:bg-neutral-700 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Watchlist Grid */}
      {watchlist.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <AnimatePresence>
            {sortedWatchlist.map((stock, index) => (
              <WatchlistItem
                key={stock.symbol}
                stock={stock}
                onRemove={removeStock}
                onAnalyze={analyzeStock}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-neutral-900 p-12 rounded-2xl border border-neutral-800 max-w-md mx-auto">
            <HeartIcon className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-neutral-400 mb-6">
              Start by searching and adding stocks you want to track above.
            </p>
            <div className="text-neutral-500 text-sm">
              <p>Popular stocks: AAPL, MSFT, GOOGL, AMZN, TSLA</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Watchlist 