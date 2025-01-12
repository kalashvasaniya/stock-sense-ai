import OpenAI from "openai";

// Configure OpenAI client with browser safety flag
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your_fallback_api_key",
  dangerouslyAllowBrowser: true // Only add this if you understand the security implications
});

export const getStockSummary = async (stockSymbol) => {
  try {
    // Input validation
    if (!stockSymbol || typeof stockSymbol !== 'string') {
      throw new Error('Invalid stock symbol provided');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Corrected model name
      messages: [
        {
          role: "system",
          content: "You are a financial analyst providing clear, concise stock summaries for retail investors."
        },
        {
          role: "user",
          content: `Provide a brief analysis of ${stockSymbol}'s recent performance, including key metrics and notable trends.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    
    // Enhanced error handling
    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your OpenAI API credentials.");
    } else if (error.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    
    throw new Error(`Failed to fetch stock summary: ${error.message}`);
  }
};