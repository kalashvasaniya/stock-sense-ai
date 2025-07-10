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

        // Enhanced Perplexity AI analysis with better error handling
        let analysis = {
            summary: "Analysis temporarily unavailable due to API limitations.",
            outlook: "neutral" as const,
            confidence: 0,
            keyFactors: ["Data retrieved successfully"],
            technicalIndicators: {
                rsi: "N/A",
                trend: "neutral",
                support: "N/A",
                resistance: "N/A"
            }
        };

        try {
            const perplexityPayload = {
                model: "llama-3.1-sonar-small-128k-online",
                messages: [
                    {
                        role: "system",
                        content: `You are a professional financial analyst. Analyze the provided stock data and return ONLY a valid JSON object with the following structure:
{
  "summary": "Brief 2-3 sentence analysis of the stock",
  "outlook": "bullish|bearish|neutral",
  "confidence": number_between_0_and_100,
  "keyFactors": ["factor1", "factor2", "factor3"],
  "technicalIndicators": {
    "rsi": "overbought|oversold|neutral",
    "trend": "uptrend|downtrend|sideways",
    "support": "price_level_or_N/A",
    "resistance": "price_level_or_N/A"
  }
}
Return ONLY the JSON object, no additional text.`
                    },
                    {
                        role: "user",
                        content: `Analyze ${stockSymbol} (${combinedData.companyName}):
Current Price: $${combinedData.currentPrice}
Change: ${combinedData.changePercent}%
Market Cap: $${combinedData.marketCap}
Sector: ${combinedData.sector}
Industry: ${combinedData.industry}
P/E Ratio: ${combinedData.peRatio}
52W High: $${combinedData.weekHigh52}
52W Low: $${combinedData.weekLow52}
Beta: ${combinedData.beta}`
                    }
                ],
                max_tokens: 500,
                temperature: 0.1,
                top_p: 0.9
            };

            console.log('Calling Perplexity API...');
            const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                },
                body: JSON.stringify(perplexityPayload),
            });

            if (perplexityResponse.ok) {
                const perplexityData = await perplexityResponse.json();
                
                if (perplexityData?.choices?.[0]?.message?.content) {
                    try {
                        const content = perplexityData.choices[0].message.content.trim();
                        // Remove any markdown formatting if present
                        const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
                        const parsedAnalysis = JSON.parse(cleanContent);
                        
                        // Validate the parsed analysis structure
                        if (parsedAnalysis.summary && parsedAnalysis.outlook && typeof parsedAnalysis.confidence === 'number') {
                            analysis = {
                                ...analysis,
                                ...parsedAnalysis,
                                confidence: Math.min(Math.max(parsedAnalysis.confidence, 0), 100) // Ensure confidence is between 0-100
                            };
                            console.log('Successfully parsed Perplexity analysis');
                        } else {
                            console.warn('Invalid analysis structure from Perplexity');
                        }
                    } catch (parseError) {
                        console.error("Failed to parse Perplexity response:", parseError);
                        console.log("Raw content:", perplexityData.choices[0].message.content);
                    }
                } else {
                    console.warn('No content in Perplexity response');
                }
            } else {
                const errorText = await perplexityResponse.text();
                console.error(`Perplexity API error: ${perplexityResponse.status} - ${errorText}`);
            }
        } catch (error) {
            console.error("Perplexity API request failed:", error);
        }

        const finalResponse = {
            ...combinedData,
            analysis,
            timestamp: new Date().toISOString(),
            dataQuality: {
                finnhub: finnhubData.status === 'fulfilled' ? 'success' : 'failed',
                alphaVantageQuote: alphaVantageData.status === 'fulfilled' ? 'success' : 'failed',
                alphaVantageOverview: overviewData.status === 'fulfilled' ? 'success' : 'failed'
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