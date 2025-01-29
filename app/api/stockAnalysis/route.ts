import { NextResponse } from "next/server";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const stockSymbol = searchParams.get("symbol");

        if (!stockSymbol) {
            return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 });
        }

        if (!FINNHUB_API_KEY || !ALPHA_VANTAGE_API_KEY || !PERPLEXITY_API_KEY) {
            return NextResponse.json({ error: "Missing API keys" }, { status: 500 });
        }

        // Fetch stock data from Finnhub
        const [finnhubResponse, alphaVantageResponse, overviewResponse] = await Promise.all([
            fetch(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${FINNHUB_API_KEY}`),
            fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
            fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
        ]);

        const [finnhubData, alphaVantageData, overviewData] = await Promise.all([
            finnhubResponse.json(),
            alphaVantageResponse.json(),
            overviewResponse.json()
        ]);

        if (!finnhubResponse.ok || finnhubData.error) {
            throw new Error(`Finnhub API error: ${finnhubData.error}`);
        }

        if (!alphaVantageResponse.ok || alphaVantageData["Error Message"]) {
            throw new Error(`Alpha Vantage API error: ${alphaVantageData["Error Message"]}`);
        }

        const globalQuote = alphaVantageData["Global Quote"] || {};

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

        // Fetch analysis from Perplexity AI
        let analysis = {
            summary: "Unable to generate analysis due to an error.",
            outlook: "neutral",
            confidence: 0,
            keyFactors: ["API Error"],
        };

        try {
            const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "sonar-pro",
                    messages: [
                        {
                            role: "system",
                            content: "You are a financial analyst. Provide a brief analysis and future outlook for the given stock data in valid JSON format."
                        },
                        {
                            role: "user",
                            content: `Analyze ${stockSymbol} (${combinedData.companyName}). Current price: $${combinedData.currentPrice}. `
                                + `Change: ${combinedData.changePercent}%. Market cap: $${combinedData.marketCap}. `
                                + `Sector: ${combinedData.sector}. Industry: ${combinedData.industry}. `
                                + "Return JSON analysis with these keys: summary, outlook (bullish/bearish/neutral), confidence (0-100), keyFactors (array)."
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.3,
                }),
            });

            const perplexityData = await perplexityResponse.json();

            if (perplexityData?.choices?.[0]?.message?.content) {
                try {
                    analysis = JSON.parse(perplexityData.choices[0].message.content);
                } catch (parseError) {
                    console.error("JSON parsing error:", parseError);
                    analysis.summary = "Analysis format error";
                }
            }
        } catch (error) {
            console.error("Perplexity API error:", error.message);
        }

        return NextResponse.json({
            ...combinedData,
            analysis,
        });

    } catch (error) {
        console.error("Error processing stock data:", error);
        return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
    }
}