"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import {
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  EyeIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline"

// Technical Indicators Calculations
const calculateSMA = (data, period) => {
  return data.map((item, index) => {
    if (index < period - 1) return { ...item, sma: null }
    const sum = data.slice(index - period + 1, index + 1).reduce((acc, curr) => acc + curr.price, 0)
    return { ...item, sma: sum / period }
  })
}

const calculateEMA = (data, period) => {
  const multiplier = 2 / (period + 1)
  return data.map((item, index) => {
    if (index === 0) return { ...item, ema: item.price }
    const prevEma = data[index - 1].ema || item.price
    return { ...item, ema: (item.price - prevEma) * multiplier + prevEma }
  })
}

const calculateRSI = (data, period = 14) => {
  return data.map((item, index) => {
    if (index < period) return { ...item, rsi: 50 }
    
    const gains = []
    const losses = []
    
    for (let i = index - period + 1; i <= index; i++) {
      const change = data[i].price - data[i - 1]?.price || 0
      if (change > 0) gains.push(change)
      else losses.push(Math.abs(change))
    }
    
    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period
    
    if (avgLoss === 0) return { ...item, rsi: 100 }
    
    const rs = avgGain / avgLoss
    const rsi = 100 - (100 / (1 + rs))
    
    return { ...item, rsi: Math.round(rsi * 100) / 100 }
  })
}

const calculateBollingerBands = (data, period = 20, standardDeviations = 2) => {
  return data.map((item, index) => {
    if (index < period - 1) {
      return { ...item, bollingerUpper: null, bollingerLower: null, bollingerMiddle: null }
    }
    
    const slice = data.slice(index - period + 1, index + 1)
    const sum = slice.reduce((acc, curr) => acc + curr.price, 0)
    const average = sum / period
    
    const squaredDifferences = slice.map(d => Math.pow(d.price - average, 2))
    const variance = squaredDifferences.reduce((acc, curr) => acc + curr, 0) / period
    const standardDeviation = Math.sqrt(variance)
    
    return {
      ...item,
      bollingerUpper: average + (standardDeviations * standardDeviation),
      bollingerLower: average - (standardDeviations * standardDeviation),
      bollingerMiddle: average
    }
  })
}

const generateCandlestickData = (baseData) => {
  return baseData.map((item, index) => {
    const basePrice = item.price
    const volatility = 0.02
    
    const open = index === 0 ? basePrice : baseData[index - 1].close || basePrice
    const close = basePrice
    const high = Math.max(open, close) * (1 + Math.random() * volatility)
    const low = Math.min(open, close) * (1 - Math.random() * volatility)
    
    return {
      ...item,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    }
  })
}

// Custom Candlestick Component
const CustomCandlestick = ({ payload, x, y, width, height }) => {
  if (!payload) return null
  
  const { open, high, low, close } = payload
  const isPositive = close >= open
  const color = isPositive ? "#10B981" : "#EF4444"
  const bodyHeight = Math.abs(close - open) * height / (payload.high - payload.low)
  const bodyY = y + (Math.max(high, close, open) - Math.max(close, open)) * height / (high - low)
  
  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + width * 0.2}
        y={bodyY}
        width={width * 0.6}
        height={Math.max(bodyHeight, 1)}
        fill={color}
      />
    </g>
  )
}

const TradingViewChart = ({ data, symbol, className = "" }) => {
  const [chartType, setChartType] = useState("line")
  const [timeframe, setTimeframe] = useState("1D")
  const [indicators, setIndicators] = useState({
    sma: false,
    ema: false,
    rsi: false,
    bollinger: false
  })
  const [showVolume, setShowVolume] = useState(true)
  const [processedData, setProcessedData] = useState([])

  useEffect(() => {
    if (!data || data.length === 0) return

    let processed = [...data]

    // Add candlestick data
    processed = generateCandlestickData(processed)

    // Add technical indicators based on settings
    if (indicators.sma) {
      processed = calculateSMA(processed, 20)
    }
    if (indicators.ema) {
      processed = calculateEMA(processed, 12)
    }
    if (indicators.rsi) {
      processed = calculateRSI(processed, 14)
    }
    if (indicators.bollinger) {
      processed = calculateBollingerBands(processed, 20, 2)
    }

    setProcessedData(processed)
  }, [data, indicators])

  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }))
  }

  const formatTooltipValue = (value, name) => {
    if (name === "Volume") return [value?.toLocaleString(), name]
    if (typeof value === 'number') return [`$${value.toFixed(2)}`, name]
    return [value, name]
  }

  const getChartComponent = () => {
    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: "#A3A3A3", fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              tick={{ fill: "#A3A3A3", fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              domain={['dataMin * 0.98', 'dataMax * 1.02']}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#1C1C1C", 
                border: "1px solid #404040",
                borderRadius: "8px" 
              }}
              labelStyle={{ color: "#F5F5F5" }}
              formatter={formatTooltipValue}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#3B82F6" 
              fill="url(#colorGradient)" 
              strokeWidth={2}
            />
            {indicators.sma && (
              <Line 
                type="monotone" 
                dataKey="sma" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                dot={false}
              />
            )}
            {indicators.ema && (
              <Line 
                type="monotone" 
                dataKey="ema" 
                stroke="#8B5CF6" 
                strokeWidth={2} 
                dot={false}
              />
            )}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        )

      case "candlestick":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: "#A3A3A3", fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fill: "#A3A3A3", fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                domain={['dataMin * 0.98', 'dataMax * 1.02']}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "#1C1C1C", 
                  border: "1px solid #404040",
                  borderRadius: "8px" 
                }}
                labelStyle={{ color: "#F5F5F5" }}
                formatter={(value, name) => {
                  if (name === 'open') return [`Open: $${typeof value === 'number' ? value.toFixed(2) : value}`, '']
                  if (name === 'high') return [`High: $${typeof value === 'number' ? value.toFixed(2) : value}`, '']
                  if (name === 'low') return [`Low: $${typeof value === 'number' ? value.toFixed(2) : value}`, '']
                  if (name === 'close') return [`Close: $${typeof value === 'number' ? value.toFixed(2) : value}`, '']
                  return formatTooltipValue(value, name)
                }}
              />
              <Line type="monotone" dataKey="high" stroke="#10B981" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey="low" stroke="#EF4444" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey="open" stroke="#6B7280" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="close" stroke="#F3F4F6" strokeWidth={2} dot={false} />
              {indicators.bollinger && (
                <>
                  <Line type="monotone" dataKey="bollingerUpper" stroke="#F59E0B" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="bollingerLower" stroke="#F59E0B" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="bollingerMiddle" stroke="#F59E0B" strokeWidth={1} dot={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      default: // line chart
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: "#A3A3A3", fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              tick={{ fill: "#A3A3A3", fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              domain={['dataMin * 0.98', 'dataMax * 1.02']}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#1C1C1C", 
                border: "1px solid #404040",
                borderRadius: "8px" 
              }}
              labelStyle={{ color: "#F5F5F5" }}
              formatter={formatTooltipValue}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#3B82F6" }}
            />
            {indicators.sma && (
              <Line 
                type="monotone" 
                dataKey="sma" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                dot={false}
                name="SMA (20)"
              />
            )}
            {indicators.ema && (
              <Line 
                type="monotone" 
                dataKey="ema" 
                stroke="#8B5CF6" 
                strokeWidth={2} 
                dot={false}
                name="EMA (12)"
              />
            )}
            {indicators.bollinger && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="bollingerUpper" 
                  stroke="#F59E0B" 
                  strokeWidth={1} 
                  strokeDasharray="5 5" 
                  dot={false}
                  name="BB Upper"
                />
                <Line 
                  type="monotone" 
                  dataKey="bollingerLower" 
                  stroke="#F59E0B" 
                  strokeWidth={1} 
                  strokeDasharray="5 5" 
                  dot={false}
                  name="BB Lower"
                />
                <Line 
                  type="monotone" 
                  dataKey="bollingerMiddle" 
                  stroke="#F59E0B" 
                  strokeWidth={1} 
                  dot={false}
                  name="BB Middle"
                />
              </>
            )}
          </LineChart>
        )
    }
  }

  return (
    <div className={`bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden ${className}`}>
      {/* Chart Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Advanced Chart</h3>
              <p className="text-neutral-400 text-sm">{symbol} - Interactive Trading View</p>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Chart Type Selector */}
            <div className="flex bg-neutral-800 rounded-lg p-1">
              {[
                { value: "line", label: "Line", icon: "📈" },
                { value: "area", label: "Area", icon: "📊" },
                { value: "candlestick", label: "Candle", icon: "🕯️" }
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setChartType(value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    chartType === value
                      ? "bg-blue-600 text-white"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-700"
                  }`}
                >
                  <span className="mr-1">{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Timeframe Selector */}
            <div className="flex bg-neutral-800 rounded-lg p-1">
              {["1D", "1W", "1M", "3M", "1Y"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    timeframe === tf
                      ? "bg-green-600 text-white"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-700"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-neutral-400 mr-2">Indicators:</span>
          {[
            { key: "sma", label: "SMA (20)", color: "text-amber-500" },
            { key: "ema", label: "EMA (12)", color: "text-purple-500" },
            { key: "rsi", label: "RSI (14)", color: "text-pink-500" },
            { key: "bollinger", label: "Bollinger Bands", color: "text-orange-500" }
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleIndicator(key)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                indicators[key]
                  ? `border-blue-500 bg-blue-500/10 text-blue-400`
                  : "border-neutral-600 bg-neutral-800/50 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {label}
            </button>
          ))}
          
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              showVolume
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-neutral-600 bg-neutral-800/50 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            Volume
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="p-6">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {getChartComponent()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume Chart */}
      {showVolume && (
        <div className="px-6 pb-6">
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData} margin={{ top: 0, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#A3A3A3", fontSize: 10 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fill: "#A3A3A3", fontSize: 10 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#1C1C1C", 
                    border: "1px solid #404040",
                    borderRadius: "8px" 
                  }}
                  labelStyle={{ color: "#F5F5F5" }}
                  formatter={(value) => [value?.toLocaleString(), "Volume"]}
                />
                <Bar dataKey="volume" fill="#6366F1" radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* RSI Indicator Chart */}
      {indicators.rsi && (
        <div className="px-6 pb-6">
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData} margin={{ top: 0, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#A3A3A3", fontSize: 10 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: "#A3A3A3", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#1C1C1C", 
                    border: "1px solid #404040",
                    borderRadius: "8px" 
                  }}
                  labelStyle={{ color: "#F5F5F5" }}
                  formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, "RSI"]}
                />
                <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="5 5" />
                <ReferenceLine y={30} stroke="#10B981" strokeDasharray="5 5" />
                <Line 
                  type="monotone" 
                  dataKey="rsi" 
                  stroke="#EC4899" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingViewChart 