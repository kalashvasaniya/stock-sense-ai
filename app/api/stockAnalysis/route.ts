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

        // Fetch stock data from Finnhub API
        const finnhubResponse = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${FINNHUB_API_KEY}`
        );
        const finnhubData = await finnhubResponse.json();

        if (!finnhubResponse.ok || finnhubData.error) {
            throw new Error(`Finnhub API error: ${finnhubData.error}`);
        }

        // Fetch stock data from Alpha Vantage API
        const alphaVantageResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const alphaVantageData = await alphaVantageResponse.json();

        if (!alphaVantageResponse.ok || alphaVantageData["Error Message"]) {
            throw new Error(`Alpha Vantage API error: ${alphaVantageData["Error Message"]}`);
        }

        // Fetch company overview from Alpha Vantage API
        const overviewResponse = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const overviewData = await overviewResponse.json();

        // Extracting and structuring data
        const globalQuote = alphaVantageData["Global Quote"] || {};
        const combinedData = {
            symbol: stockSymbol,
            companyName: overviewData?.Name || "N/A",
            sector: overviewData?.Sector || "N/A",
            industry: overviewData?.Industry || "N/A",
            currentPrice: finnhubData?.c ?? globalQuote?.["05. price"] ?? "N/A",
            change: finnhubData?.d ?? globalQuote?.["09. change"] ?? "N/A",
            changePercent:
                (finnhubData?.dp ?? parseFloat(globalQuote?.["10. change percent"]?.replace("%", ""))) || "N/A",
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
        let analysis

        try {
            const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "pplx-7b-chat", // Use correct model name
                    response_format: { type: "json_object" }, // Request JSON format
                    messages: [
                        {
                            role: "system",
                            content: "You are a financial analyst. Provide a brief analysis and future outlook for the given stock data in valid JSON format."
                        },
                        {
                            role: "user",
                            content: `Analyze ${stockSymbol} (${combinedData.companyName}). Current price: $${combinedData.currentPrice?.toFixed(2) || 'N/A'}. `
                                + `Change: ${combinedData.changePercent?.toFixed(2) + '%' || 'N/A'}. Market cap: $${combinedData.marketCap?.toLocaleString() || 'N/A'}. `
                                + `Sector: ${combinedData.sector}. Industry: ${combinedData.industry}. `
                                + "Return JSON analysis with these EXACT keys: summary, outlook (bullish/bearish/neutral), confidence (0-100), keyFactors (array)."
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.3,
                }),
            });

            if (!perplexityResponse.ok) {
                throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
            }

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