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

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StockSummary() {
    const [stockSymbol, setStockSymbol] = useState("AAPL"); // Default to AAPL
    const [summary, setSummary] = useState(""); // State for the stock summary result
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [graphData, setGraphData] = useState(null); // State for graph data

    // Function to fetch stock summary
    const fetchSummary = async () => {
        setLoading(true);
        setSummary(""); // Reset summary while fetching
        setGraphData(null); // Reset graph data
        try {
            const result = await getStockSummary(stockSymbol);
            setSummary(result.summary); // Update with the fetched summary
            setGraphData(result.graphData); // Update with graph data
        } catch (error) {
            setSummary("Error fetching stock summary. Please try again."); // Handle errors
        }
        setLoading(false);
    };

    // Fetch AAPL data initially when component mounts
    useEffect(() => {
        fetchSummary();
    }, []); // Empty dependency array to run only once

    return (
        <div className="p-8 bg-gradient-to-b from-gray-800 to-black rounded-xl shadow-2xl border border-gray-700 mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-100">
                AI-Powered Stock Summary
            </h2>

            {/* Input for stock symbol */}
            <input
                type="text"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value)}
                className="p-3 bg-gray-800 border border-gray-700 rounded-lg w-full mb-6 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />

            {/* Fetch summary button */}
            <button
                onClick={fetchSummary}
                className={`bg-gradient-to-r from-teal-500 to-indigo-500 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium ${loading ? "opacity-75 cursor-not-allowed" : "hover:from-teal-600 hover:to-indigo-600"
                    }`}
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg
                            className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Analyzing...
                    </span>
                ) : (
                    "Get Summary"
                )}
            </button>

            {/* Display summary if available */}
            {summary && (
                <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-100 mb-3">Summary:</p>
                    <p className="text-gray-300 leading-relaxed">{summary}</p>
                </div>
            )}

            {/* Display graph if data is available */}
            {graphData && (
                <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-100 mb-3">Stock Performance:</p>
                    <Line
                        data={{
                            labels: graphData.labels,
                            datasets: [
                                {
                                    label: "Stock Price",
                                    data: graphData.data,
                                    borderColor: "rgba(75, 192, 192, 1)",
                                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                                    tension: 0.4,
                                },
                            ],
                        }}
                    />
                </div>
            )}
        </div>
    );

    // Sample API function for fetching stock summary
    async function getStockSummary(stockSymbol) {
        if (stockSymbol.toUpperCase() === "AAPL") {
            return {
                summary:
                    "Apple Inc. (AAPL) is a technology company known for its hardware and software products, including the iPhone, Mac, and iOS. Its stock is trading at $175 with a market cap of $2.8 trillion.",
                graphData: {
                    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    data: [170, 172, 174, 175, 173], // Example stock prices
                },
            };
        } else {
            throw new Error("Stock symbol not found.");
        }
    }
}