"use server";

import { analyzeMarketSentiment, AnalyzeMarketSentimentInput } from "@/ai/flows/analyze-market-sentiment";

export async function getMarketSentimentAnalysis(input: AnalyzeMarketSentimentInput) {
    try {
        const result = await analyzeMarketSentiment(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error analyzing market sentiment:", error);
        return { success: false, error: "Failed to analyze market sentiment." };
    }
}
