import { useState } from 'react';
import { Line, Bar } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, BarChart2, Activity } from 'lucide-react';

const EnhancedStockDashboard = () => {
    const [stockSymbol, setStockSymbol] = useState("");
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stockSymbol.trim()) {
            setError("Please enter a stock symbol");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/stockAnalysis?symbol=${stockSymbol.trim()}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setStockData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const MetricCard = ({ title, value, icon: Icon, change, color = "blue" }) => (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <p className="text-2xl font-bold mt-2 text-white">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-${color}-500/20`}>
                    <Icon className={`w-6 h-6 text-${color}-500`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                    Advanced Stock Analysis Dashboard
                </h1>

                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-4">
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
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Analyze"}
                        </button>
                    </div>
                </form>

                {/* {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )} */}

                {stockData && (
                    <div className="space-y-6">
                        {/* Company Header */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{stockData.companyName}</h2>
                                    <p className="text-gray-400">{stockData.symbol} • {stockData.sector}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">${stockData.currentPrice.toFixed(2)}</p>
                                    <p className={`text-lg ${stockData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Market Cap"
                                value={`$${(stockData.marketCap / 1e9).toFixed(2)}B`}
                                icon={DollarSign}
                                color="green"
                            />
                            <MetricCard
                                title="Volume"
                                value={stockData.volume.toLocaleString()}
                                icon={BarChart2}
                                color="purple"
                            />
                            <MetricCard
                                title="Market Cap"
                                value={stockData.marketCap !== "N/A" ? `$${(stockData.marketCap / 1e9).toFixed(2)}B` : "N/A"}
                                icon={DollarSign}
                                color="green"
                            />
                            <MetricCard
                                title="Volume"
                                value={stockData.volume !== "N/A" ? stockData.volume.toLocaleString() : "N/A"}
                                icon={BarChart2}
                                color="purple"
                            />

                        </div>

                        {/* Trading Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 className="text-xl font-semibold text-white mb-4">Trading Information</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Open</span>
                                        <span className="text-white">
                                            {typeof stockData.open === 'number'
                                                ? `$${stockData.open.toFixed(2)}`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Previous Close</span>
                                        <span className="text-white">
                                            {typeof stockData.previousClose === 'number'
                                                ? `$${stockData.previousClose.toFixed(2)}`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Day Range</span>
                                        <span className="text-white">
                                            {typeof stockData.low === 'number' && typeof stockData.high === 'number'
                                                ? `$${stockData.low.toFixed(2)} - $${stockData.high.toFixed(2)}`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">52 Week Range</span>
                                        <span className="text-white">
                                            {typeof stockData.weekLow52 === 'number' && typeof stockData.weekHigh52 === 'number'
                                                ? `$${stockData.weekLow52.toFixed(2)} - $${stockData.weekHigh52.toFixed(2)}`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
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
                                                <span className={`px-3 py-1 rounded-full text-sm ${stockData.analysis.outlook === 'bullish' ? 'bg-green-500/20 text-green-400' :
                                                    stockData.analysis.outlook === 'bearish' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {stockData.analysis.outlook.toUpperCase()}
                                                </span>
                                                <span className="text-gray-400">
                                                    Confidence: {stockData.analysis.confidence}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedStockDashboard;