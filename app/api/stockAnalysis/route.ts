import { NextResponse } from "next/server";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Helper function to safely parse numeric values
const safeParseNumber = (value: any): number | "N/A" => {
    if (value === null || value === undefined || value === "") return "N/A";
    const parsed = parseFloat(value);
    return isNaN(parsed) ? "N/A" : parsed;
};

// Helper function to format large numbers
const formatNumber = (value: any): number | "N/A" => {
    if (value === null || value === undefined || value === "") return "N/A";
    const parsed = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : parseFloat(value);
    return isNaN(parsed) ? "N/A" : parsed;
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const stockSymbol = searchParams.get("symbol")?.toUpperCase().trim();

        if (!stockSymbol) {
            return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 });
        }

        if (!FINNHUB_API_KEY || !ALPHA_VANTAGE_API_KEY || !PERPLEXITY_API_KEY) {
            return NextResponse.json({ 
                error: "Missing API keys. Please configure FINNHUB_API_KEY, ALPHA_VANTAGE_API_KEY, and PERPLEXITY_API_KEY" 
            }, { status: 500 });
        }

        console.log(`Fetching data for symbol: ${stockSymbol}`);

        // Fetch stock data from multiple sources with improved error handling
        const fetchPromises = [
            fetch(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${FINNHUB_API_KEY}`)
                .then(res => res.ok ? res.json() : Promise.reject(`Finnhub error: ${res.status}`)),
            fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
                .then(res => res.ok ? res.json() : Promise.reject(`Alpha Vantage Global Quote error: ${res.status}`)),
            fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
                .then(res => res.ok ? res.json() : Promise.reject(`Alpha Vantage Overview error: ${res.status}`))
        ];

        const [finnhubData, alphaVantageData, overviewData] = await Promise.allSettled(fetchPromises);

        // Process Finnhub data
        let finnhubQuote: any = {};
        if (finnhubData.status === 'fulfilled' && !finnhubData.value?.error) {
            finnhubQuote = finnhubData.value;
        } else {
            console.warn('Finnhub data failed:', finnhubData.status === 'rejected' ? finnhubData.reason : finnhubData.value?.error);
        }

        // Process Alpha Vantage global quote
        let globalQuote: any = {};
        if (alphaVantageData.status === 'fulfilled' && !alphaVantageData.value?.["Error Message"]) {
            globalQuote = alphaVantageData.value?.["Global Quote"] || {};
        } else {
            console.warn('Alpha Vantage Global Quote failed:', alphaVantageData.status === 'rejected' ? alphaVantageData.reason : alphaVantageData.value?.["Error Message"]);
        }

        // Process Alpha Vantage overview
        let overview: any = {};
        if (overviewData.status === 'fulfilled' && !overviewData.value?.["Error Message"]) {
            overview = overviewData.value || {};
        } else {
            console.warn('Alpha Vantage Overview failed:', overviewData.status === 'rejected' ? overviewData.reason : overviewData.value?.["Error Message"]);
        }

        // Combine data with fallbacks
        const combinedData = {
            symbol: stockSymbol,
            companyName: overview?.Name || overview?.Symbol || stockSymbol,
            sector: overview?.Sector || "N/A",
            industry: overview?.Industry || "N/A",
            currentPrice: safeParseNumber(finnhubQuote?.c || globalQuote?.["05. price"]),
            change: safeParseNumber(finnhubQuote?.d || globalQuote?.["09. change"]),
            changePercent: safeParseNumber(finnhubQuote?.dp || globalQuote?.["10. change percent"]?.replace("%", "")),
            high: safeParseNumber(finnhubQuote?.h || globalQuote?.["03. high"]),
            low: safeParseNumber(finnhubQuote?.l || globalQuote?.["04. low"]),
            open: safeParseNumber(finnhubQuote?.o || globalQuote?.["02. open"]),
            previousClose: safeParseNumber(finnhubQuote?.pc || globalQuote?.["08. previous close"]),
            marketCap: formatNumber(overview?.MarketCapitalization),
            volume: formatNumber(globalQuote?.["06. volume"]),
            peRatio: safeParseNumber(overview?.PERatio),
            dividendYield: safeParseNumber(overview?.DividendYield),
            weekHigh52: safeParseNumber(overview?.["52WeekHigh"]),
            weekLow52: safeParseNumber(overview?.["52WeekLow"]),
            eps: safeParseNumber(overview?.EPS),
            beta: safeParseNumber(overview?.Beta),
            bookValue: safeParseNumber(overview?.BookValue),
            priceToBook: safeParseNumber(overview?.PriceToBookRatio),
            ebitda: formatNumber(overview?.EBITDA),
            revenue: formatNumber(overview?.RevenueTTM),
            grossProfitTTM: formatNumber(overview?.GrossProfitTTM),
            operatingMarginTTM: safeParseNumber(overview?.OperatingMarginTTM),
            profitMargin: safeParseNumber(overview?.ProfitMargin),
            returnOnAssetsTTM: safeParseNumber(overview?.ReturnOnAssetsTTM),
            returnOnEquityTTM: safeParseNumber(overview?.ReturnOnEquityTTM),
            description: overview?.Description || "No description available"
        };

        // Create intelligent fallback analysis based on real data
        const createFallbackAnalysis = (data: any) => {
            const currentPrice = data.currentPrice;
            const changePercent = data.changePercent;
            const peRatio = data.peRatio;
            const weekHigh52 = data.weekHigh52;
            const weekLow52 = data.weekLow52;
            
            let outlook = "neutral";
            let confidence = 65;
            let keyFactors = [];
            
            // Determine outlook based on real metrics
            if (typeof changePercent === 'number') {
                if (changePercent > 5) {
                    outlook = "bullish";
                    confidence = 75;
                    keyFactors.push("Strong positive momentum with significant gains");
                } else if (changePercent > 0) {
                    outlook = "bullish";
                    confidence = 60;
                    keyFactors.push("Positive price movement indicates buying interest");
                } else if (changePercent < -5) {
                    outlook = "bearish";
                    confidence = 75;
                    keyFactors.push("Significant decline suggests selling pressure");
                } else if (changePercent < 0) {
                    outlook = "bearish";
                    confidence = 60;
                    keyFactors.push("Negative price movement indicates weakness");
                }
            }
            
            // Analyze P/E ratio
            if (typeof peRatio === 'number') {
                if (peRatio > 0 && peRatio < 15) {
                    keyFactors.push("Attractive valuation with low P/E ratio");
                    confidence += 5;
                } else if (peRatio > 30) {
                    keyFactors.push("High P/E ratio suggests premium valuation");
                    if (outlook === "bullish") confidence -= 5;
                }
            }
            
            // Analyze 52-week position
            if (typeof currentPrice === 'number' && typeof weekHigh52 === 'number' && typeof weekLow52 === 'number') {
                const position = (currentPrice - weekLow52) / (weekHigh52 - weekLow52);
                if (position > 0.8) {
                    keyFactors.push("Trading near 52-week highs shows strength");
                } else if (position < 0.2) {
                    keyFactors.push("Trading near 52-week lows, potential value opportunity");
                }
            }
            
            // Add sector info if available
            if (data.sector && data.sector !== "N/A") {
                keyFactors.push(`${data.sector} sector exposure`);
            }
            
            // Ensure we have at least some key factors
            if (keyFactors.length === 0) {
                keyFactors.push("Financial data retrieved and analyzed");
            }
            
            // Create summary based on analysis
            let summary = `${data.companyName} is currently ${outlook === 'bullish' ? 'showing positive signals' : outlook === 'bearish' ? 'showing negative signals' : 'in a neutral position'}`;
            if (typeof changePercent === 'number') {
                summary += ` with a ${changePercent >= 0 ? 'gain' : 'loss'} of ${Math.abs(changePercent).toFixed(2)}% in recent trading.`;
            }
            
            return {
                summary,
                outlook,
                confidence: Math.min(confidence, 85), // Cap confidence
                keyFactors: keyFactors.slice(0, 4), // Limit to 4 factors
                technicalIndicators: {
                    rsi: typeof changePercent === 'number' ? (changePercent > 5 ? "overbought" : changePercent < -5 ? "oversold" : "neutral") : "neutral",
                    trend: typeof changePercent === 'number' ? (changePercent > 2 ? "uptrend" : changePercent < -2 ? "downtrend" : "sideways") : "sideways",
                    support: typeof weekLow52 === 'number' ? weekLow52.toFixed(2) : "N/A",
                    resistance: typeof weekHigh52 === 'number' ? weekHigh52.toFixed(2) : "N/A"
                }
            };
        };

        // Enhanced Perplexity AI analysis with better error handling
        let analysis = createFallbackAnalysis(combinedData);

        // Try to enhance analysis with Perplexity AI (optional enhancement)
        if (PERPLEXITY_API_KEY && PERPLEXITY_API_KEY.length > 10) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const perplexityPayload = {
                    model: "llama-3.1-sonar-small-128k-online",
                    messages: [
                        {
                            role: "system",
                            content: "You are a financial analyst. Analyze the stock data and respond with valid JSON only. No markdown, no explanations, just JSON."
                        },
                        {
                            role: "user",
                            content: `Analyze ${stockSymbol} stock:
Price: $${combinedData.currentPrice}
Change: ${combinedData.changePercent}%
P/E: ${combinedData.peRatio}
Sector: ${combinedData.sector}

Return JSON with: {"summary": "brief analysis", "outlook": "bullish/bearish/neutral", "confidence": 75, "keyFactors": ["factor1", "factor2"]}`
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.2
                };

                console.log('Attempting Perplexity AI enhancement...');
                const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                    },
                    body: JSON.stringify(perplexityPayload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (perplexityResponse.ok) {
                    const perplexityData = await perplexityResponse.json();
                    
                    if (perplexityData?.choices?.[0]?.message?.content) {
                        try {
                            let content = perplexityData.choices[0].message.content.trim();
                            
                            // Clean up the response
                            content = content.replace(/```json\n?|```\n?/g, '');
                            content = content.replace(/^[^{]*({[\s\S]*})[^}]*$/, '$1');
                            
                            const aiAnalysis = JSON.parse(content);
                            
                            // Validate and merge AI analysis
                            if (aiAnalysis.summary && typeof aiAnalysis.summary === 'string') {
                                analysis.summary = aiAnalysis.summary;
                                console.log('✅ AI analysis successfully integrated');
                            }
                            if (aiAnalysis.outlook && ['bullish', 'bearish', 'neutral'].includes(aiAnalysis.outlook)) {
                                analysis.outlook = aiAnalysis.outlook;
                            }
                            if (typeof aiAnalysis.confidence === 'number' && aiAnalysis.confidence > 0) {
                                analysis.confidence = Math.min(Math.max(aiAnalysis.confidence, 30), 90);
                            }
                            if (Array.isArray(aiAnalysis.keyFactors) && aiAnalysis.keyFactors.length > 0) {
                                analysis.keyFactors = [...aiAnalysis.keyFactors.slice(0, 3), ...analysis.keyFactors.slice(0, 2)].slice(0, 4);
                            }
                        } catch (parseError) {
                            console.warn("AI response parsing failed, using fallback analysis");
                        }
                    }
                } else {
                    console.warn(`Perplexity API returned ${perplexityResponse.status}, using fallback analysis`);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn("Perplexity API timed out, using fallback analysis");
                } else {
                    console.warn("Perplexity API failed, using fallback analysis:", error.message);
                }
            }
        } else {
            console.log("Perplexity API key not configured, using intelligent fallback analysis");
        }

        // Fetch real historical data for charts
        let historicalData = [];
        try {
            const historicalResponse = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=compact`);
            if (historicalResponse.ok) {
                const historicalJson = await historicalResponse.json();
                const timeSeries = historicalJson["Time Series (Daily)"];
                
                if (timeSeries) {
                    // Get last 30 days of real data
                    const dates = Object.keys(timeSeries).slice(0, 30).reverse();
                    historicalData = dates.map(date => {
                        const dayData = timeSeries[date];
                        return {
                            date,
                            price: parseFloat(dayData["4. close"]),
                            open: parseFloat(dayData["1. open"]),
                            high: parseFloat(dayData["2. high"]),
                            low: parseFloat(dayData["3. low"]),
                            volume: parseInt(dayData["5. volume"])
                        };
                    });
                }
            }
        } catch (error) {
            console.warn("Failed to fetch historical data:", error);
        }

        const finalResponse = {
            ...combinedData,
            analysis,
            historicalData,
            timestamp: new Date().toISOString(),
            dataQuality: {
                finnhub: finnhubData.status === 'fulfilled' ? 'success' : 'failed',
                alphaVantageQuote: alphaVantageData.status === 'fulfilled' ? 'success' : 'failed',
                alphaVantageOverview: overviewData.status === 'fulfilled' ? 'success' : 'failed',
                historical: historicalData.length > 0 ? 'success' : 'failed'
            }
        };

        console.log(`Successfully processed data for ${stockSymbol}`);
        return NextResponse.json(finalResponse);

    } catch (error) {
        console.error("Error processing stock data:", error);
        return NextResponse.json({ 
            error: "Failed to fetch stock data",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}