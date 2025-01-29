import { NextResponse } from "next/server"

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const stockSymbol = searchParams.get("symbol")

    if (!stockSymbol) {
        return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 })
    }

    try {
        // Fetch data from Finnhub
        const finnhubResponse = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${FINNHUB_API_KEY}`
        )
        const finnhubData = await finnhubResponse.json()

        if (finnhubData.error) {
            throw new Error(`Finnhub API error: ${finnhubData.error}`)
        }

        // Fetch data from Alpha Vantage
        const alphaVantageResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        )
        const alphaVantageData = await alphaVantageResponse.json()

        if (alphaVantageData["Error Message"]) {
            throw new Error(`Alpha Vantage API error: ${alphaVantageData["Error Message"]}`)
        }

        // Fetch company overview from Alpha Vantage
        const overviewResponse = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        )
        const overviewData = await overviewResponse.json()

        // Safely get Alpha Vantage Global Quote data
        const globalQuote = alphaVantageData["Global Quote"] || {}

        // Combine data from both APIs
        const combinedData = {
            symbol: stockSymbol,
            companyName: overviewData?.Name || "N/A",
            sector: overviewData?.Sector || "N/A",
            industry: overviewData?.Industry || "N/A",
            currentPrice: finnhubData?.c ?? globalQuote?.["05. price"] ?? "N/A",
            change: finnhubData?.d ?? globalQuote?.["09. change"] ?? "N/A",
            changePercent: (finnhubData?.dp ?? parseFloat(globalQuote?.["10. change percent"]?.replace("%", ""))) || "N/A",
            high: finnhubData?.h ?? globalQuote?.["03. high"] ?? "N/A",
            low: finnhubData?.l ?? globalQuote?.["04. low"] ?? "N/A",
            open: finnhubData?.o ?? globalQuote?.["02. open"] ?? "N/A",
            previousClose: finnhubData?.pc ?? globalQuote?.["08. previous close"] ?? "N/A",
            marketCap: overviewData?.MarketCapitalization ? Number(overviewData.MarketCapitalization) : "N/A",
            volume: globalQuote?.["06. volume"] ? Number(globalQuote["06. volume"]) : "N/A",
            peRatio: isNaN(Number(overviewData?.PERatio)) ? "N/A" : Number(overviewData?.PERatio),
            dividendYield: isNaN(Number(overviewData?.DividendYield)) ? "N/A" : Number(overviewData?.DividendYield),
            weekHigh52: isNaN(Number(overviewData?.["52WeekHigh"])) ? "N/A" : Number(overviewData?.["52WeekHigh"]),
            weekLow52: isNaN(Number(overviewData?.["52WeekLow"])) ? "N/A" : Number(overviewData?.["52WeekLow"]),
        };


        let analysis: {
            summary: string
            outlook: "bullish" | "bearish" | "neutral"
            confidence: number
            keyFactors: string[]
        }

        try {
            // Use Perplexity API for analysis
            const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "sonar",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a financial analyst. Provide a brief analysis and future outlook for the given stock data.",
                        },
                        {
                            role: "user",
                            content: `Analyze the stock ${stockSymbol} (${combinedData.companyName}) based on the following data:
                Sector: ${combinedData.sector}
                Industry: ${combinedData.industry}
                Current Price: ${typeof combinedData.currentPrice === 'number' ? '$' + combinedData.currentPrice.toFixed(2) : combinedData.currentPrice}
                Change: ${typeof combinedData.change === 'number' ? '$' + combinedData.change.toFixed(2) : combinedData.change} (${typeof combinedData.changePercent === 'number' ? combinedData.changePercent.toFixed(2) + '%' : combinedData.changePercent})
                Open: ${typeof combinedData.open === 'number' ? '$' + combinedData.open.toFixed(2) : combinedData.open}
                Previous Close: ${typeof combinedData.previousClose === 'number' ? '$' + combinedData.previousClose.toFixed(2) : combinedData.previousClose}
                Day Range: ${typeof combinedData.low === 'number' ? '$' + combinedData.low.toFixed(2) : combinedData.low} - ${typeof combinedData.high === 'number' ? '$' + combinedData.high.toFixed(2) : combinedData.high}
                52 Week Range: ${typeof combinedData.weekLow52 === 'number' ? '$' + combinedData.weekLow52.toFixed(2) : combinedData.weekLow52} - ${typeof combinedData.weekHigh52 === 'number' ? '$' + combinedData.weekHigh52.toFixed(2) : combinedData.weekHigh52}
                Volume: ${typeof combinedData.volume === 'number' ? combinedData.volume.toLocaleString() : combinedData.volume}
                Market Cap: ${typeof combinedData.marketCap === 'number' ? '$' + combinedData.marketCap.toLocaleString() : combinedData.marketCap}
                P/E Ratio: ${combinedData.peRatio}
                Dividend Yield: ${typeof combinedData.dividendYield === 'number' ? combinedData.dividendYield.toFixed(2) + '%' : combinedData.dividendYield}

                Provide a brief analysis and future outlook. Consider market trends, company performance, and industry factors. Return the response as a JSON object with the following structure:
                {
                  "summary": "Brief analysis text (2-3 sentences)",
                  "outlook": "bullish|bearish|neutral",
                  "confidence": number (0-100),
                  "keyFactors": ["factor1", "factor2", "factor3"]
                }`,
                        },
                    ],
                    max_tokens: 250,
                }),
            })

            const perplexityData = await perplexityResponse.json()

            if (!perplexityData.choices || !perplexityData.choices[0]?.message?.content) {
                throw new Error("Invalid response from Perplexity API")
            }

            let parsedAnalysis: {
                summary?: string
                outlook?: "bullish" | "bearish" | "neutral"
                confidence?: number
                keyFactors?: string[]
            }
            try {
                // First, try to parse the content if it's a string
                parsedAnalysis = JSON.parse(perplexityData.choices[0].message.content)
            } catch (e) {
                console.error("Error parsing Perplexity response:", e)
                throw new Error("Invalid JSON in Perplexity response")
            }

            // Validate and sanitize the analysis object
            analysis = {
                summary: String(parsedAnalysis?.summary || "No summary provided."),
                outlook: (parsedAnalysis?.outlook === "bullish" || parsedAnalysis?.outlook === "bearish" || parsedAnalysis?.outlook === "neutral")
                    ? parsedAnalysis.outlook
                    : "neutral",
                confidence: typeof parsedAnalysis?.confidence === "number" && parsedAnalysis.confidence >= 0 && parsedAnalysis.confidence <= 100
                    ? parsedAnalysis.confidence
                    : 0,
                keyFactors: Array.isArray(parsedAnalysis?.keyFactors)
                    ? parsedAnalysis.keyFactors.map(factor => String(factor)).slice(0, 5)
                    : ["No key factors provided"]
            }

        } catch (error) {
            console.error("Error with Perplexity API:", error)
            analysis = {
                summary: "Unable to generate analysis due to an error.",
                outlook: "neutral",
                confidence: 0,
                keyFactors: ["API Error"],
            }
        }

        return NextResponse.json({
            ...combinedData,
            analysis,
        })
    } catch (error) {
        console.error("Error fetching stock data:", error)
        return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
    }
}