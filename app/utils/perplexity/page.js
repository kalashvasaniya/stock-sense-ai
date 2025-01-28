"use client";

const PERPLEXITY_API_KEY = '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';

export const getStockAnalysis = async (stockSymbol) => {
    try {
        if (!stockSymbol || typeof stockSymbol !== 'string') {
            throw new Error('Invalid stock symbol provided');
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: `You are a financial analyst. Return a JSON object with the following structure:
                        {
                            "summary": "Brief analysis text",
                            "metrics": {
                                "currentPrice": number,
                                "marketCap": string,
                                "peRatio": number,
                                "volume": number,
                                "weekHigh52": number,
                                "weekLow52": number
                            },
                            "historicalPrices": {
                                "dates": ["YYYY-MM-DD"],
                                "prices": [number],
                                "volumes": [number]
                            },
                            "trends": {
                                "shortTerm": "bullish|bearish|neutral",
                                "longTerm": "bullish|bearish|neutral",
                                "volatility": "high|medium|low",
                                "sentiment": number
                            }
                        }`
                    },
                    {
                        role: 'user',
                        content: `Analyze ${stockSymbol} stock and provide data in the specified JSON format. Include real metrics where possible.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error with Perplexity API:", error);
        if (error.response?.status === 401) {
            throw new Error("Invalid API key. Please check your Perplexity API credentials.");
        } else if (error.response?.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw new Error(`Failed to fetch stock analysis: ${error.message}`);
    }
};

export const processStockData = (analysisResult, stockSymbol) => {
    try {
        // Parse the JSON response from Perplexity
        const data = typeof analysisResult === 'string' ? JSON.parse(analysisResult) : analysisResult;

        // Extract historical data
        const dates = data.historicalPrices?.dates || generateDates(5);
        const prices = data.historicalPrices?.prices || generatePrices(data.metrics?.currentPrice || 100, 5);
        const volumes = data.historicalPrices?.volumes || generateVolumes(5);

        // Calculate trends and predictions
        const predictions = generatePredictions(prices, 5);
        const volatility = calculateVolatility(prices);
        const movingAverages = calculateMovingAverages(prices);
        const sentiment = normalizeSentiment(data.trends?.sentiment || 50);

        return {
            summary: data.summary || `Analysis for ${stockSymbol} is currently unavailable.`,
            graphData: {
                labels: dates,
                data: prices,
            },
            predictionData: {
                labels: [...dates.slice(-3), ...generateDates(3, dates[dates.length - 1])],
                predictedPrices: [...prices.slice(-3), ...predictions.slice(0, 3)],
            },
            volumeData: {
                labels: dates,
                data: volumes,
            },
            volatilityData: {
                labels: dates,
                data: volatility,
            },
            movingAveragesData: {
                labels: dates,
                shortTerm: movingAverages.shortTerm,
                longTerm: movingAverages.longTerm,
            },
            marketTrendData: {
                labels: dates,
                data: generateTrendData(data.trends?.shortTerm, dates.length),
            },
        };
    } catch (error) {
        console.error("Error processing stock data:", error);
        return generateFallbackData(stockSymbol);
    }
};

// Helper functions
const generateDates = (count, startDate = null) => {
    const dates = [];
    let currentDate = startDate ? new Date(startDate) : new Date();

    for (let i = 0; i < count; i++) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const generatePrices = (basePrice, count) => {
    const prices = [];
    let currentPrice = basePrice;

    for (let i = 0; i < count; i++) {
        prices.push(currentPrice);
        currentPrice *= (1 + (Math.random() * 0.04 - 0.02)); // ±2% change
    }
    return prices;
};

const generateVolumes = (count) => {
    return Array(count).fill(0).map(() => Math.floor(Math.random() * 1000000) + 500000);
};

const calculateVolatility = (prices) => {
    return prices.map((price, i) => {
        if (i === 0) return 0;
        return Math.abs((price - prices[i - 1]) / prices[i - 1] * 100);
    });
};

const calculateMovingAverages = (prices) => {
    const shortTermPeriod = 5;
    const longTermPeriod = 10;

    const calculateMA = (period) => {
        return prices.map((_, i) => {
            if (i < period - 1) return prices[i];
            const slice = prices.slice(i - period + 1, i + 1);
            return slice.reduce((sum, val) => sum + val, 0) / period;
        });
    };

    return {
        shortTerm: calculateMA(shortTermPeriod),
        longTerm: calculateMA(longTermPeriod),
    };
};

const generatePredictions = (prices, count) => {
    const lastPrice = prices[prices.length - 1];
    return Array(count).fill(0).map((_, i) => {
        return lastPrice * (1 + (Math.random() * 0.06 - 0.02) * (i + 1));
    });
};

const normalizeSentiment = (sentiment) => {
    return Math.max(0, Math.min(100, sentiment));
};

const generateTrendData = (trend, count) => {
    const baseValue = trend === 'bullish' ? 70 : trend === 'bearish' ? 30 : 50;
    return Array(count).fill(0).map(() => baseValue + (Math.random() * 20 - 10));
};

const generateFallbackData = (stockSymbol) => {
    const dates = generateDates(5);
    const prices = generatePrices(100, 5);

    return {
        summary: `Fallback analysis for ${stockSymbol}. Unable to fetch real-time data.`,
        graphData: { labels: dates, data: prices },
        predictionData: {
            labels: [...dates, ...generateDates(2, dates[dates.length - 1])],
            predictedPrices: [...prices, ...generatePredictions(prices, 2)],
        },
        volumeData: { labels: dates, data: generateVolumes(5) },
        volatilityData: { labels: dates, data: calculateVolatility(prices) },
        movingAveragesData: {
            labels: dates,
            ...calculateMovingAverages(prices),
        },
        marketTrendData: { labels: dates, data: generateTrendData('neutral', 5) },
    };
};