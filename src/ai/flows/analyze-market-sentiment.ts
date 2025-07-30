// This is an auto-generated file from Firebase Studio.
'use server';
/**
 * @fileOverview An AI agent that analyzes market sentiment using news and social media data.
 *
 * - analyzeMarketSentiment - A function that returns a market sentiment summary.
 * - AnalyzeMarketSentimentInput - The input type for the analyzeMarketSentiment function.
 * - AnalyzeMarketSentimentOutput - The return type for the analyzeMarketSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMarketSentimentInputSchema = z.object({
  query: z
    .string()
    .describe('The query to analyze market sentiment for, e.g. EUR/USD.'),
});
export type AnalyzeMarketSentimentInput = z.infer<
  typeof AnalyzeMarketSentimentInputSchema
>;

const AnalyzeMarketSentimentOutputSchema = z.object({
  sentimentSummary: z
    .string()
    .describe('A summary of the current market sentiment.'),
  supportingNewsItems: z
    .array(z.string())
    .describe('A list of supporting news items for the sentiment summary.'),
});
export type AnalyzeMarketSentimentOutput = z.infer<
  typeof AnalyzeMarketSentimentOutputSchema
>;

export async function analyzeMarketSentiment(
  input: AnalyzeMarketSentimentInput
): Promise<AnalyzeMarketSentimentOutput> {
  return analyzeMarketSentimentFlow(input);
}

const getMarketSentiment = ai.defineTool(
  {
    name: 'getMarketSentiment',
    description:
      'Analyze financial news and social media to determine the market sentiment for a given query.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The query to analyze sentiment for (e.g., EUR/USD).'),
    }),
    outputSchema: z.object({
      sentiment: z
        .string()
        .describe(
          'A description of market sentiment based on recent news and social media.'
        ),
      newsItems: z
        .array(z.string())
        .describe('News items supporting the sentiment.'),
    }),
  },
  async function (input) {
    // Mock implementation - replace with actual sentiment analysis logic
    console.log(`Analyzing sentiment for ${input.query}`);
    return {
      sentiment: `The market sentiment for ${input.query} is currently neutral.`,
      newsItems: [`No significant news impacting ${input.query} was found.`],
    };
  }
);

const analyzeMarketSentimentPrompt = ai.definePrompt({
  name: 'analyzeMarketSentimentPrompt',
  tools: [getMarketSentiment],
  input: {schema: AnalyzeMarketSentimentInputSchema},
  output: {schema: AnalyzeMarketSentimentOutputSchema},
  prompt: `You are a financial analyst summarizing market sentiment for forex traders.

  Analyze the market sentiment for the given query using the getMarketSentiment tool.
  Include supporting news items in your response ONLY if the sentiment is positive or negative and ONLY if they add useful context to the user; however, do not include more than 3 news items.

  Query: {{{query}}}`,
});

const analyzeMarketSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeMarketSentimentFlow',
    inputSchema: AnalyzeMarketSentimentInputSchema,
    outputSchema: AnalyzeMarketSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeMarketSentimentPrompt(input);
    return output!;
  }
);
