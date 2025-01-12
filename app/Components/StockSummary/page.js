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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
            const result = await getStockSummary(stockSymbol);
            setSummary(result.summary);
            setGraphData(result.graphData);
            setPredictionData(result.predictionData);
            setVolumeData(result.volumeData);
            setVolatilityData(result.volatilityData);
            setMovingAveragesData(result.movingAveragesData);
            setMarketTrendData(result.marketTrendData);
        } catch (error) {
            setSummary("Error fetching stock summary. Please try again.");
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
                    onChange={(e) => setStockSymbol(e.target.value)}
                    className="flex-1 px-4 py-2 w-full rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                    onClick={fetchSummary}
                    className={`px-6 py-2 rounded-lg bg-sky-600 text-white font-medium shadow-lg transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Get Summary"}
                </button>
            </div>

            {summary && (
                <div className="mt-8 p-4 bg-gray-800 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-white mb-2">Stock Summary</h2>
                    <p className="text-gray-300">{summary}</p>
                </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[graphData, predictionData, volumeData, volatilityData, movingAveragesData, marketTrendData].map(
                    (data, index) =>
                        data && (
                            <div key={index} className="p-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-md hover:shadow-xl">
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    {[
                                        "Stock Performance",
                                        "Future Prediction",
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
                                                    "50-Day Moving Avg",
                                                    "Market Sentiment",
                                                ][index],
                                                data: data.data || data.predictedPrices || data.shortTerm,
                                                borderColor: [
                                                    "#FFD700", // Gold
                                                    "#1E90FF", // Royal Blue
                                                    "#228B22", // Forest Green
                                                    "#FF6347", // Tomato
                                                    "#8A2BE2", // Blue Violet
                                                    "#20B2AA", // Light Sea Green
                                                ][index],
                                                backgroundColor: [
                                                    "rgba(255, 215, 0, 0.2)", // Gold
                                                    "rgba(30, 144, 255, 0.2)", // Royal Blue
                                                    "rgba(34, 139, 34, 0.2)", // Forest Green
                                                    "rgba(255, 99, 71, 0.2)", // Tomato
                                                    "rgba(138, 43, 226, 0.2)", // Blue Violet
                                                    "rgba(32, 178, 170, 0.2)", // Light Sea Green
                                                ][index],
                                                tension: 0.4,
                                                ...(index === 1 && { borderDash: [5, 5] }), // Dash pattern for predictions
                                            },
                                        ],
                                    }}
                                />
                            </div>
                        )
                )}
            </div>
        </div>
    );

    async function getStockSummary(stockSymbol) {
        if (stockSymbol.toUpperCase() === "AAPL") {
            return {
                summary:
                    "Apple Inc. (AAPL) is a leading tech company. Stock Price: $175, Market Cap: $2.8T.",
                graphData: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    data: [170, 172, 174, 175, 173],
                },
                predictionData: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Next Mon", "Next Tue"],
                    predictedPrices: [173, 175, 178, 180, 182, 185, 188],
                },
                volumeData: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    data: [1000, 1200, 1100, 1300, 1400],
                },
                volatilityData: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    data: [2, 1.5, 1.8, 2.1, 1.9],
                },
                movingAveragesData: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    shortTerm: [170, 171, 172, 173, 174],
                    longTerm: [165, 166, 167, 168, 169],
                },
                marketTrendData: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    data: [60, 70, 80, 90, 85],
                },
            };
        }
    }
}
