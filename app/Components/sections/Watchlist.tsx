"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  StarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ChartBarIcon,
  EyeIcon,
  BellIcon
} from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"



const formatCurrency = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatPercentage = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return "N/A"
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
}

// Stock search functionality using real API
const searchStocks = async (query) => {
  if (!query || query.length < 1) return []
  
  // For demo, search from popular stocks
  const popularStocks = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX", 
    "ORCL", "CRM", "ADBE", "PYPL", "INTC", "AMD", "UBER", "LYFT", 
    "SNAP", "SPOT", "SQ", "ROKU", "JPM", "BAC", "WFC", "GS", 
    "V", "MA", "DIS", "KO", "PEP", "WMT"
  ]
  
  const matchingSymbols = popularStocks.filter(symbol => 
    symbol.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5)
  
  // Fetch real data for matching symbols
  const promises = matchingSymbols.map(async (symbol) => {
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
  return results.filter(Boolean)
}

// Fetch real stock data
const fetchStockData = async (symbol) => {
  try {
    const response = await fetch(`/api/stockAnalysis?symbol=${symbol}`)
    if (response.ok) {
      const data = await response.json()
      return {
        symbol: data.symbol,
        name: data.companyName,
        price: data.currentPrice,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        marketCap: data.marketCap,
        peRatio: data.peRatio
      }
    }
  } catch (error) {
    console.error(`Failed to fetch data for ${symbol}:`, error)
  }
  return null
}

// Stock Search Component
const StockSearch = ({ onAddStock, watchlistSymbols }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (query.length > 0) {
        setIsSearching(true)
        const searchResults = await searchStocks(query)
        setResults(searchResults)
        setIsSearching(false)
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [query])

  const handleAddStock = (stock) => {
    onAddStock(stock)
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search stocks to add..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-neutral-400 text-sm mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((stock) => {
                  const isInWatchlist = watchlistSymbols.includes(stock.symbol)
                  return (
                    <button
                      key={stock.symbol}
                      onClick={() => !isInWatchlist && handleAddStock(stock)}
                      disabled={isInWatchlist}
                      className={`w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors flex items-center justify-between ${
                        isInWatchlist ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium">{stock.symbol}</span>
                          <span className="text-neutral-400 text-sm">{stock.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-white text-sm">{formatCurrency(stock.price)}</span>
                          <span className={`text-xs ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatPercentage(stock.changePercent)}
                          </span>
                        </div>
                      </div>
                      {isInWatchlist ? (
                        <span className="text-neutral-500 text-xs">Already added</span>
                      ) : (
                        <PlusIcon className="h-5 w-5 text-blue-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            ) : query.length > 0 ? (
              <div className="p-4 text-center">
                <p className="text-neutral-400 text-sm">No stocks found</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Watchlist Item Component
const WatchlistItem = ({ stock, onRemove, delay = 0 }) => (
  <motion.div
    className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-all duration-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.01 }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <StarIconSolid className="h-5 w-5 text-yellow-500" />
        <div>
          <h4 className="text-white font-semibold">{stock.symbol}</h4>
          <p className="text-neutral-400 text-sm truncate max-w-[200px]">{stock.name}</p>
        </div>
      </div>
      <button
        onClick={() => onRemove(stock.symbol)}
        className="text-neutral-400 hover:text-red-500 transition-colors"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>

    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-white font-bold text-lg">{formatCurrency(stock.price)}</span>
        <div className={`flex items-center space-x-1 ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {stock.changePercent >= 0 ? (
            <ArrowTrendingUpIcon className="h-4 w-4" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-700">
        <div>
          <span className="text-neutral-400 text-xs">Volume</span>
          <p className="text-white text-sm">{typeof stock.volume === 'number' ? stock.volume.toLocaleString() : 'N/A'}</p>
        </div>
        <div>
          <span className="text-neutral-400 text-xs">P/E Ratio</span>
          <p className="text-white text-sm">{typeof stock.peRatio === 'number' ? stock.peRatio.toFixed(2) : 'N/A'}</p>
        </div>
      </div>
    </div>
  </motion.div>
)

// Portfolio Summary Component
const PortfolioSummary = ({ watchlist }) => {
  const totalStocks = watchlist.length
  const gainers = watchlist.filter(stock => typeof stock.changePercent === 'number' && stock.changePercent > 0).length
  const losers = watchlist.filter(stock => typeof stock.changePercent === 'number' && stock.changePercent < 0).length
  const avgChange = watchlist.length > 0 ? 
    watchlist.reduce((sum, stock) => sum + (typeof stock.changePercent === 'number' ? stock.changePercent : 0), 0) / watchlist.length : 0

  return (
    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
        <ChartBarIcon className="h-6 w-6 text-blue-500" />
        <span>Portfolio Summary</span>
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{totalStocks}</p>
          <p className="text-neutral-400 text-sm">Total Stocks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{gainers}</p>
          <p className="text-neutral-400 text-sm">Gainers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{losers}</p>
          <p className="text-neutral-400 text-sm">Losers</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${avgChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercentage(avgChange)}
          </p>
          <p className="text-neutral-400 text-sm">Avg Change</p>
        </div>
      </div>
    </div>
  )
}

// Main Watchlist Component
const Watchlist = ({ className = "" }) => {
  const [watchlist, setWatchlist] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(false)

  // Load watchlist from localStorage on component mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stockWatchlist')
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist)
        setWatchlist(parsed)
        // Refresh data for saved stocks
        refreshWatchlistData(parsed)
      } catch (error) {
        console.error('Failed to parse saved watchlist:', error)
      }
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stockWatchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const refreshWatchlistData = async (stocks = watchlist) => {
    if (stocks.length === 0) return
    
    setLoading(true)
    try {
      const promises = stocks.map(stock => fetchStockData(stock.symbol))
      const results = await Promise.all(promises)
      
      const updatedWatchlist = results.filter(Boolean)
      setWatchlist(updatedWatchlist)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to refresh watchlist data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToWatchlist = async (stockData) => {
    // Check if already in watchlist
    if (watchlist.some(stock => stock.symbol === stockData.symbol)) {
      return
    }

    // Fetch fresh data for the stock
    const freshData = await fetchStockData(stockData.symbol)
    if (freshData) {
      setWatchlist(prev => [...prev, freshData])
    }
  }

  const removeFromWatchlist = (symbol) => {
    setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol))
  }

  // Real-time data refresh every 30 seconds for demo
  useEffect(() => {
    if (watchlist.length === 0) return

    const interval = setInterval(() => {
      refreshWatchlistData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [watchlist.length])

  const watchlistSymbols = watchlist.map(stock => stock.symbol)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-yellow-500/10 p-3 rounded-xl">
            <StarIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">My Watchlist</h2>
        </div>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Track your favorite stocks with real-time data and performance metrics.
        </p>
        <p className="text-neutral-500 text-sm mt-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </motion.div>

      {/* Stock Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StockSearch onAddStock={addToWatchlist} watchlistSymbols={watchlistSymbols} />
      </motion.div>

      {/* Portfolio Summary */}
      {watchlist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <PortfolioSummary watchlist={watchlist} />
        </motion.div>
      )}

      {/* Watchlist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {loading && watchlist.length > 0 && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-2 text-neutral-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm">Updating prices...</span>
            </div>
          </div>
        )}

        {watchlist.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <EyeIcon className="h-6 w-6 text-blue-500" />
                <span>Tracked Stocks ({watchlist.length})</span>
              </h3>
              <button
                onClick={() => refreshWatchlistData()}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors text-sm"
              >
                {loading ? "Updating..." : "Refresh Data"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((stock, index) => (
                <WatchlistItem
                  key={stock.symbol}
                  stock={stock}
                  onRemove={removeFromWatchlist}
                  delay={0.1 * index}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-neutral-800/50 rounded-xl p-8 max-w-md mx-auto">
              <StarIcon className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your Watchlist is Empty</h3>
              <p className="text-neutral-400 mb-4">
                Start by searching and adding stocks you want to track above.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500">
                <BellIcon className="h-4 w-4" />
                <span>Get real-time updates on your favorite stocks</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Watchlist 