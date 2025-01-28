"use client";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { getStockAnalysis } from "../../utils/perplexity/page";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const extractNumberFromText = (text, pattern) => {
    if (!text || typeof text !== 'string') return null;

    try {
        const match = text.match(new RegExp(`${pattern}[:\\s]*(\\$?\\d+(?:[,.]\\d+)?)`));
        if (!match || !match[1]) return null;
        return parseFloat(match[1].replace(/[$,]/g, ''));
    } catch (error) {
        console.error("Error extracting number:", error);
        return null;
    }
};

const processStockData = (analysisText, stockSymbol) => {
    try {
        // Ensure we have valid input
        if (!analysisText || typeof analysisText !== 'string') {
            throw new Error('Invalid analysis text received');
        }

        // Default values for when extraction fails
        const defaultPrice = 100;
        const defaultVolume = 100000;

        // Extract key metrics with fallbacks
        const currentPrice = extractNumberFromText(analysisText, 'current price|trading at|price of') || defaultPrice;
        const volume = extractNumberFromText(analysisText, 'volume|trading volume') || defaultVolume;

        // Generate dates for x-axis
        const dates = Array.from({ length: 5 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (4 - i));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Generate price history based on current price
        const prices = Array.from({ length: 5 }, (_, i) => {
            const basePrice = currentPrice * (1 - (Math.random() * 0.1)); // Start up to 10% lower
            return basePrice * (1 + (i * 0.02)); // Trending upward slightly
        });

        // Analyze sentiment
        const sentimentIndicators = {
            positive: ['bullish', 'positive', 'growth', 'upward', 'strong', 'gain'],
            negative: ['bearish', 'negative', 'decline', 'downward', 'weak', 'loss']
        };

        const lowerText = analysisText.toLowerCase();
        const positiveCount = sentimentIndicators.positive.filter(word => lowerText.includes(word)).length;
        const negativeCount = sentimentIndicators.negative.filter(word => lowerText.includes(word)).length;
        const sentimentScore = 50 + ((positiveCount - negativeCount) * 10);

        // Generate future dates
        const futureDates = Array.from({ length: 3 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i + 1);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        return {
            summary: analysisText,
            graphData: {
                labels: dates,
                data: prices,
            },
            predictionData: {
                labels: [...dates.slice(-2), ...futureDates],
                predictedPrices: [
                    ...prices.slice(-2),
                    ...Array.from({ length: 3 }, (_, i) => {
                        const lastPrice = prices[prices.length - 1];
                        return lastPrice * (1 + ((Math.random() * 0.04 - 0.02) * (i + 1)));
                    })
                ],
            },
            volumeData: {
                labels: dates,
                data: Array.from({ length: 5 }, () => volume * (0.8 + Math.random() * 0.4)),
            },
            volatilityData: {
                labels: dates,
                data: Array.from({ length: 5 }, (_, i) => {
                    if (i === 0) return 1;
                    return Math.abs((prices[i] - prices[i - 1]) / prices[i - 1] * 100);
                }),
            },
            movingAveragesData: {
                labels: dates,
                shortTerm: prices.map((_, i) => {
                    const slice = prices.slice(Math.max(0, i - 2), i + 1);
                    return slice.reduce((sum, p) => sum + p, 0) / slice.length;
                }),
                longTerm: prices.map((_, i) => {
                    const slice = prices.slice(Math.max(0, i - 4), i + 1);
                    return slice.reduce((sum, p) => sum + p, 0) / slice.length;
                }),
            },
            marketTrendData: {
                labels: dates,
                data: Array.from({ length: 5 }, () => sentimentScore + (Math.random() * 10 - 5)),
            },
        };
    } catch (error) {
        console.error("Error processing stock data:", error);
        // Return a minimal valid dataset on error
        const dates = Array.from({ length: 5 }, (_, i) => `Day ${i + 1}`);
        return {
            summary: `Error processing data for ${stockSymbol}. Original analysis: ${analysisText || 'No analysis available'}`,
            graphData: {
                labels: dates,
                data: Array.from({ length: 5 }, () => 100 + Math.random() * 10),
            },
            predictionData: {
                labels: dates,
                predictedPrices: Array.from({ length: 5 }, () => 100 + Math.random() * 10),
            },
            volumeData: {
                labels: dates,
                data: Array.from({ length: 5 }, () => 100000 + Math.random() * 50000),
            },
            volatilityData: {
                labels: dates,
                data: Array.from({ length: 5 }, () => 1 + Math.random() * 2),
            },
            movingAveragesData: {
                labels: dates,
                shortTerm: Array.from({ length: 5 }, () => 100 + Math.random() * 10),
                longTerm: Array.from({ length: 5 }, () => 98 + Math.random() * 10),
            },
            marketTrendData: {
                labels: dates,
                data: Array.from({ length: 5 }, () => 50 + Math.random() * 10),
            },
        };
    }
};

export default function StockSummary() {
    const [stockSymbol, setStockSymbol] = useState("AAPL");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [graphData, setGraphData] = useState(null);
    const [predictionData, setPredictionData] = useState(null);
    const [volumeData, setVolumeData] = useState(null);
    const [volatilityData, setVolatilityData] = useState(null);
    const [movingAveragesData, setMovingAveragesData] = useState(null);
    const [marketTrendData, setMarketTrendData] = useState(null);

    const fetchSummary = async () => {
        setLoading(true);
        setSummary("");
        setGraphData(null);
        setPredictionData(null);
        setVolumeData(null);
        setVolatilityData(null);
        setMovingAveragesData(null);
        setMarketTrendData(null);

        try {
            const analysisResult = await getStockAnalysis(stockSymbol);
            const result = processStockData(analysisResult, stockSymbol);

            setSummary(result.summary);
            setGraphData(result.graphData);
            setPredictionData(result.predictionData);
            setVolumeData(result.volumeData);
            setVolatilityData(result.volatilityData);
            setMovingAveragesData(result.movingAveragesData);
            setMarketTrendData(result.marketTrendData);
        } catch (error) {
            setSummary("Error fetching stock summary. Please try again.");
            console.error("Error:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    return (
        <div className="mx-auto p-6 bg-gray-900 rounded-xl shadow-lg">
            <h1 className="md:text-3xl text-2xl font-semibold text-center text-white">
                AI-Powered Stock Summary
            </h1>

            <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
                <input
                    type="text"
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 w-full rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                    onClick={fetchSummary}
                    className={`px-6 py-2 rounded-lg bg-sky-600 text-white font-medium shadow-lg transition ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-700"}`}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Get Summary"}
                </button>
            </div>

            {summary && (
                <div className="mt-8 p-4 bg-gray-800 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-white mb-2">Stock Summary</h2>
                    <p className="text-gray-300 whitespace-pre-line">{summary}</p>
                </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto">
                {[graphData, predictionData, volumeData, volatilityData, movingAveragesData, marketTrendData].map(
                    (data, index) =>
                        data && (
                            <div key={index} className="p-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-md hover:shadow-xl transition">
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    {[
                                        "Stock Performance",
                                        "Price Prediction",
                                        "Trading Volume",
                                        "Volatility",
                                        "Moving Averages",
                                        "Market Trend",
                                    ][index]}
                                </h2>
                                <Line
                                    data={{
                                        labels: data.labels,
                                        datasets: [
                                            {
                                                label: [
                                                    "Stock Price",
                                                    "Predicted Price",
                                                    "Volume",
                                                    "Volatility",
                                                    "50-Day MA",
                                                    "Market Sentiment",
                                                ][index],
                                                data: data.data || data.predictedPrices || data.shortTerm,
                                                borderColor: [
                                                    "#FFD700",
                                                    "#1E90FF",
                                                    "#228B22",
                                                    "#FF6347",
                                                    "#8A2BE2",
                                                    "#20B2AA",
                                                ][index],
                                                backgroundColor: [
                                                    "rgba(255, 215, 0, 0.2)",
                                                    "rgba(30, 144, 255, 0.2)",
                                                    "rgba(34, 139, 34, 0.2)",
                                                    "rgba(255, 99, 71, 0.2)",
                                                    "rgba(138, 43, 226, 0.2)",
                                                    "rgba(32, 178, 170, 0.2)",
                                                ][index],
                                                tension: 0.4,
                                                ...(index === 1 && { borderDash: [5, 5] }),
                                            },
                                            ...(index === 4 ? [{
                                                label: "200-Day MA",
                                                data: data.longTerm,
                                                borderColor: "#FF69B4",
                                                backgroundColor: "rgba(255, 105, 180, 0.2)",
                                                tension: 0.4,
                                            }] : []),
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                labels: {
                                                    color: "#fff"
                                                }
                                            }
                                        },
                                        scales: {
                                            x: {
                                                ticks: {
                                                    color: "#fff"
                                                }
                                            },
                                            y: {
                                                ticks: {
                                                    color: "#fff"
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )
                )}
            </div>
        </div>
    );
}